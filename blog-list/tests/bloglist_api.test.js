const mongoose = require('mongoose')
const supertest = require('supertest')
const bcrypt = require('bcrypt')

const helper = require('./bloglist_helper')
const app = require('../app')
const api = supertest(app)

const Blog = require('../models/blog')
const User = require('../models/user')

beforeEach(async () => {
  await Blog.deleteMany({})

  const blogObjects = helper.initialBlogs
    .map(blog => new Blog(blog))
  const promiseArray = blogObjects.map(note => note.save())
  await Promise.all(promiseArray)
})

describe('when there is initially some blogs saved', () => {
  test('blogs are returned as json', async () => {
    await api
      .get('/api/blogs')
      .expect(200)
      .expect('Content-Type', /application\/json/)
  })

  test('all blogs are returned', async () => {
    const response = await api.get('/api/blogs')
    expect(response.body).toHaveLength(helper.initialBlogs.length)
  })

  test('id property is defined', async () => {
    const response = await api.get('/api/blogs')
    response.body.forEach(blog =>  {
      expect(blog.id).toBeDefined()
    })
  })
})

describe('viewing a specific blog', () => {

  test('a valid blog can be added', async () => {
    const newBlog = {
      title: 'Something patterns',
      author: 'Michael Patternson',
      url: 'https://example.com/',
      likes: 7,
    }

    await api
      .post('/api/blogs')
      .send(newBlog)
      .expect(201)
      .expect('Content-Type', /application\/json/)

    const blogsAtEnd = await helper.blogsInDb()

    expect(blogsAtEnd).toHaveLength(helper.initialBlogs.length + 1)

    const titles = blogsAtEnd.map(blog => blog.title)
    expect(titles).toContain(
      'Something patterns'
    )

  })

  test('when likes property is missing, it defaults to 0', async () => {
    const noLikes = {
      title: 'Something patterns',
      author: 'Michael Patternson',
      url: 'https://example.com/',
    }

    await api
      .post('/api/blogs')
      .send(noLikes)
      .expect(201)
      .expect('Content-Type', /application\/json/)

    const blogsAtEnd = await helper.blogsInDb()
    expect(blogsAtEnd[blogsAtEnd.length-1].likes).toBe(0)
  })

  test('fails with statuscode 400 if title and/or url are invalid', async () => {
    const noUrl = {
      title: 'No url',
      author: 'Michael Patternson',
      likes: 7,
    }

    const noTitle = {
      author: 'Michael Patternson',
      url: 'https://example.com/',
      likes: 7,
    }

    await api
      .post('/api/blogs')
      .send(noUrl)
      .expect(400)

    await api
      .post('/api/blogs')
      .send(noTitle)
      .expect(400)
  })

})

describe('deletion of a note', () => {
  test('succeeds with status code 204 if id is valid', async () => {
    const blogsAtStart = await helper.blogsInDb()

    const blogToDelete = blogsAtStart[0]


    await api
      .delete(`/api/blogs/${blogToDelete.id}`)
      .expect(204)

    const blogsAtEnd = await helper.blogsInDb()


    expect(blogsAtEnd).toHaveLength(
      helper.initialBlogs.length - 1
    )

    const titles = blogsAtEnd.map(blog => blog.title)

    expect(titles).not.toContain(blogToDelete.title)

  })
})

describe('updating the information of an individual blog post', () => {
  test('likes property is successfully updated', async () => {
    const blogs =  await helper.blogsInDb()
    const blogToUpdate = blogs[0]

    blogToUpdate.likes = 99

    await api
      .put(`/api/blogs/${blogToUpdate.id}`)
      .send(blogToUpdate)
      .expect(200)
  })
})

describe('when there is initially one user in db', () => {
  beforeEach( async () => {
    await User.deleteMany({})

    const passwordHash = await bcrypt.hash('secret', 10)
    const user = new User({ username: 'root', passwordHash })

    await user.save()
  })

  test('creation fails with proper statuscode and message if username already taken', async () => {
    const usersAtStart = await helper.usersInDb()

    const newUser = {
      username: 'root',
      name: 'Superuser',
      password: 'salainen',
    }

    const result = await api
      .post('/api/users')
      .send(newUser)
      .expect(400)
      .expect('Content-Type', /application\/json/)

    expect(result.body.error).toContain('username must be unique')

    const usersAtEnd = await helper.usersInDb()
    expect(usersAtEnd).toEqual(usersAtStart)

  })
})

afterAll(() => {
  mongoose.connection.close()
})