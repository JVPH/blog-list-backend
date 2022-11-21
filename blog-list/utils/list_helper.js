// const { countBy, toPairs, flow, head, last, maxBy } = require('lodash')
const _ = require('lodash')

// eslint-disable-next-line no-unused-vars
const dummy = (blogs) => {
  return 1
}

const totalLikes = (listOfBlogs) => {
  if(listOfBlogs.length === 0){
    return 0
  }

  const arrOfLikes = listOfBlogs.map(blog => blog.likes)

  const sumOfLikes = arrOfLikes.reduce((accumulator, currentValue) => accumulator + currentValue)

  return sumOfLikes
}

const favoriteBlog = (listOfBlogs) => {
  if(listOfBlogs.length === 0){
    return 0
  }

  const mostLikes = _.maxBy(listOfBlogs, 'likes')

  return mostLikes
}

const mostBlogs = (listOfBlogs) => {
  if(listOfBlogs.length === 0){
    return 0
  }

  const mostBlogs =  _
    .chain(listOfBlogs)
    .countBy('author')
    .entries()
    .maxBy(_.last)
    .value()

  const author = {
    author: mostBlogs[0],
    blogs: mostBlogs[1]
  }

  return author
}

const mostLikes = (listOfBlogs) => {
  if(listOfBlogs.length === 0){
    return 0
  }

  let likesPerAuthor = listOfBlogs.reduce((objAccumulator, { author, likes }) => {
    objAccumulator[author] = objAccumulator[author] || 0
    objAccumulator[author] += likes
    return objAccumulator
  },{})

  const mostLikes = _
    .chain(likesPerAuthor)
    .entries()
    .maxBy(_.last)
    .value()

  const authorWithMostLikes = {
    author: mostLikes[0],
    likes: mostLikes[1]
  }

  return authorWithMostLikes
}

module.exports = {
  dummy,
  totalLikes,
  favoriteBlog,
  mostBlogs,
  mostLikes
}