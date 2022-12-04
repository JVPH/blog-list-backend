const mongoose = require('mongoose')
const supertest = require('supertest')
const helper = require('./bloglist_helper')
const Blog = require('../models/blog')
const app = require('../app')
const api = supertest(app)

beforeEach(async () => {
  await Blog.deleteMany({})

  const blogObjects = helper.initialBlogs
    .map(blog => new Blog(blog))
  const promiseArray = blogObjects.map(note => note.save())
  await Promise.all(promiseArray)
})

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

test('when title and/or url property are missing, bad request status code is returned', async () => {
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

afterAll(() => {
  mongoose.connection.close()
})