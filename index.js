const BASE_URL = 'https://movie-list.alphacamp.io'
const INDEX_URL = BASE_URL + '/api/v1/movies/'
const POSTER_URL = BASE_URL + '/posters/'

const movies = []
let filteredMovies = []

//換頁用，一頁12個
const MOVIE_PER_PAGE=12
const paginator = document.querySelector('#paginator')
const dataPanel = document.querySelector('#data-panel')
//搜尋欄
const searchForm = document.querySelector('#search-form')
const searchInput = document.querySelector('#search-input')


function renderMovieList(data) {
  let rawHTML=''
  data.forEach((item)=>{
    rawHTML +=`<div class="col-sm-3">
        <div class="mb-2">
          <div class="card">
            <img
              src="${POSTER_URL+item.image}"
              class="card-img-top" alt="Movie Poster" />
            <div class="card-body">
              <h5 class="card-title">${item.title}</h5>
            </div>
            <div class="card-footer">
              <button class="btn btn-primary btn-show-movie" data-bs-toggle="modal" data-bs-target="#movie-modal" data-id="${item.id}">
                More
              </button>

              <button class="btn btn-info btn-add-favorite" data-id="${item.id}">+</button>
            </div>
          </div>
        </div>
      </div>`
  })
  dataPanel.innerHTML=rawHTML
}

function showMovieModal(id){
  const modalTitle = document.querySelector('#movie-modal-title')
  const modalImage = document.querySelector('#movie-modal-image')
  const modalDate = document.querySelector('#movie-modal-date')
  const modalDescription = document.querySelector('#movie-modal-descrption')

  axios.get(INDEX_URL + id).then((response)=>{
    const data =response.data.results
    modalTitle.innerText=data.title
    modalDate.innerText = 'Release date: ' + data.release_date
    modalDescription.innerText = data.description
    modalImage.innerHTML = `<img src="${POSTER_URL + data.image
      }" alt="movie-poster" class="img-fluid">`
  })
}
//加入收藏
function addToFavorite(id) {
  console.log(id)
  const list = JSON.parse(localStorage.getItem('favoriteMovies')) || []
  const movie = movies.find((movie) => movie.id === id)

  if (list.some((movie) => movie.id === id)) {
    return alert('此電影已經在收藏清單中！')
  }

  list.push(movie)
  localStorage.setItem('favoriteMovies', JSON.stringify(list))
}

//換頁
function getMoviesByPage(page){
  const data= filteredMovies.length? filteredMovies:movies
  //計算起始 index 
  const startIndex=(page-1)*MOVIE_PER_PAGE
  //回傳切割後的新陣列
  return data.slice(startIndex,startIndex+MOVIE_PER_PAGE)
}
//計算總頁數
function renderPaginator(amount){
  const numberOfPages=Math.ceil(amount/MOVIE_PER_PAGE)

  let rawHTML=''

  for(let page=1;page<=numberOfPages;page++){
    rawHTML +=`<li class="page-item"><a class="page-link" href="#" data-page="${page}">${page}</a></li>`
  }

  paginator.innerHTML=rawHTML
}
//頁數的監聽器
paginator.addEventListener('click', function onPaginatorClicked(event){
  if (event.target.tagName!=='A') return

  const page=Number(event.target.dataset.page)
  renderMovieList(getMoviesByPage(page))
})

dataPanel.addEventListener('click',function onPanelClicked(event){
  if (event.target.matches('.btn-show-movie')){
    console.log(event.target)
    console.log(event.target.dataset.id)
    showMovieModal(event.target.dataset.id)
  } else if (event.target.matches('.btn-add-favorite')){
    addToFavorite(Number(event.target.dataset.id))
  }
})



searchForm.addEventListener('submit',function onSearchFormSubmitted(event){
  //取消預設事件
  event.preventDefault()
  //取得搜尋關鍵字
  const keyword=searchInput.value.trim().toLowerCase()

  
  // if(!keyword.length){
  //   return alert('請輸入有效字串！')
  // }

  filteredMovies =movies.filter((movies)=>
    movies.title.toLowerCase().includes(keyword)
  )
  if (filteredMovies.length===0){
    return alert(`您輸入的關鍵字：${ keyword } 沒有符合條件的電影`)
  }
  renderPaginator(filteredMovies.length)
  renderMovieList(getMoviesByPage(1))
  // console.log('click')
})

axios
  .get(INDEX_URL)
  .then((response) => {
    movies.push(...response.data.results)
    //把頁數render出來
    renderPaginator(movies.length)
    renderMovieList(getMoviesByPage(1))
    //console.log(movies)
   
  })
  .catch((err) => console.log(err))