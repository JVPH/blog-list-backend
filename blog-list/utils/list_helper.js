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

  const arrOfLikes = listOfBlogs.map(blog => blog.likes)

  const mostLikes = Math.max(...arrOfLikes)

  return listOfBlogs.find(blog => blog.likes === mostLikes)
}

module.exports = {
  dummy,
  totalLikes,
  favoriteBlog,
}