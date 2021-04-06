const express = require('express');
const app= express();
const path = require('path');
const ejsmate = require('ejs-mate');
const fetch = require('node-fetch');
const mongoose = require('mongoose');
const Review = require('./models/reviews');
const List = require('./models/mylist');

mongoose.connect('mongodb://localhost:27017/FTB',{
    useNewUrlParser:true,
    useCreateIndex:true,
    useUnifiedTopolgy:true,
})
const db=mongoose.connection;
db.on("error",console.error.bind(console,"connection error:"));
db.once("open",()=>{console.log("Database connected:")});

app.use( express.static(path.join(__dirname,'public' )));
app.engine('ejs',ejsmate);
app.set('view engine','ejs');
app.set('views', path.join(__dirname,'views'));
app.use(express.urlencoded({extended:true}));

app.get('/signup',async (req,res) => {
    res.render("sign up");
})
app.get('/login',async (req,res) => {
    res.render("login");
})

async function fetchRandom(){
    const rand = Math.floor(Math.random()*5);
    const response = await fetch('https://api.themoviedb.org/3/discover/tv?api_key=05abd9d0f24c5b1dcd75fc9794dd1811'); 
    random = await response.json();
    return random.results[rand];
}
async function fetchTrending(){ 
    const response = await fetch('https://api.themoviedb.org/3/trending/all/day?api_key=05abd9d0f24c5b1dcd75fc9794dd1811'); 
    trending = await response.json();  
    return trending.results;
} 
async function fetchPopular(){ 
    const response = await fetch('https://api.themoviedb.org/3/discover/tv?api_key=05abd9d0f24c5b1dcd75fc9794dd1811&vote_count.gte=60&with_networks=213&primary_release_date.lte=Date.now()'); 
    popular = await response.json();  
    return popular.results.slice(0,5);
} 
async function fetchTopRated(){ 
    const response = await fetch('https://api.themoviedb.org/3/movie/top_rated?api_key=05abd9d0f24c5b1dcd75fc9794dd1811'); 
    topRated = await response.json();  
    return topRated.results.slice(1,6);
} 
async function fetchNewComedy(){ 
    const response = await fetch('https://api.themoviedb.org/3/discover/movie?api_key=05abd9d0f24c5b1dcd75fc9794dd1811&with_genres=35'); 
    newComedy = await response.json();  
    return newComedy.results.slice(0,5);
} 
app.get('/',async (req,res) => {
    if(req.query.q)
    {
        const query = req.query.q;
        const response = await fetch(`https://api.themoviedb.org/3/search/multi?api_key=05abd9d0f24c5b1dcd75fc9794dd1811&query=${query}`);
        searched = await response.json();
        search = searched.results;
        res.render('search',{search,query});
    }
    else{
        const trending = await fetchTrending();
        const popular = await fetchPopular();
        const topRated = await fetchTopRated();
        const random = await fetchRandom();
        const comedy = await fetchNewComedy();
        res.render('home',{trending,popular,topRated,random,comedy});
    }
})

async function fetchTrendingMovies(){ 
    const response = await fetch('https://api.themoviedb.org/3/trending/movie/day?api_key=05abd9d0f24c5b1dcd75fc9794dd1811'); 
    trendingMovies = await response.json();  
    return trendingMovies.results.slice(0,5);
} 
async function fetchUpcomingMovies(){ 
    const response = await fetch('https://api.themoviedb.org/3/discover/movie?api_key=05abd9d0f24c5b1dcd75fc9794dd1811&sort_by=release_date.desc'); 
    upcomingMovies = await response.json();  
    return upcomingMovies.results.slice(0,5);
} 
app.get('/movies',async (req,res) =>{
    const trendingMovies = await fetchTrendingMovies();
    const upcomingMovies = await fetchUpcomingMovies();
    res.render('movies',{trendingMovies,upcomingMovies});
})


async function fetchTrendingTv(){ 
    const response = await fetch('https://api.themoviedb.org/3/trending/tv/day?api_key=05abd9d0f24c5b1dcd75fc9794dd1811'); 
    trendingTv = await response.json();  
    return trendingTv.results.slice(0,5);
} 
app.get('/tvshows',async (req,res) =>{
    const trendingTv = await fetchTrendingTv();
    res.render('tvshows',{trendingTv});
})

async function fetchSearchedMovie(id){
    const response = await fetch(`https://api.themoviedb.org/3/movie/${id}?api_key=05abd9d0f24c5b1dcd75fc9794dd1811`)
    searched = await response.json();
    return searched;
}
async function fetchSearchedTv(id){
    const response = await fetch(`https://api.themoviedb.org/3/tv/${id}?api_key=05abd9d0f24c5b1dcd75fc9794dd1811`)
    searched = await response.json();
    return searched;
}
app.get('/search/movie/:id',async (req,res) =>{
    const { id }=req.params;
    const reviews = await Review.find({mid:id});
    const inList = await List.find({mid:id});
    var isInList;
    if(Object.keys(inList).length === 0){
        isInList = false;}
    else{
        isInList = true;}
    const searched = await fetchSearchedMovie(id);
    res.render('details',{searched,reviews,isInList});
})
app.get('/search/tv/:id',async (req,res) =>{
    const { id }=req.params;
    const reviews = await Review.find({mid:id});
    const inList = await List.find({mid:id});
    var isInList;
    if(Object.keys(inList).length === 0){
        isInList = false;}
    else{
        isInList = true;}
    const searched = await fetchSearchedTv(id);
    res.render('details',{searched,reviews,isInList});
})

app.post('/search/movie/:id',async (req,res) =>{
    if(Object.keys(req.body).length !== 0)
    {
    const { id }=req.params;
    var obj = req.body;
    obj.mid = id;
    const newReview = new Review(req.body);
    await newReview.save();
    res.redirect(`/search/movie/${id}`);
    }
    else{
        const { id }=req.params;
        const inList = await List.find({mid:id});
        var isInList;
        if(Object.keys(inList).length === 0){
            isInList = false;}
        else{
            isInList = true;}
        const searched = await fetchSearchedMovie(id);
        if(isInList){
            await List.findOneAndDelete({mid:id});
        }
        else{
            var obj = {title:searched.title,imlink:searched.poster_path,rating:searched.vote_average,desc:searched.overview,type:"movie",mid:id};
            const newList = new List(obj);
            await newList.save();
        }
        res.redirect(`/search/movie/${id}`);
    }
})
app.post('/search/tv/:id',async (req,res) =>{
    if(Object.keys(req.body).length !== 0)
    {
    const { id }=req.params;
    var obj = req.body;
    obj.mid = id;
    const newReview = new Review(req.body);
    await newReview.save();
    res.redirect(`/search/tv/${id}`);
    }
    else{
        const { id }=req.params;
        const inList = await List.find({mid:id});
        var isInList;
        if(Object.keys(inList).length === 0){
            isInList = false;}
        else{
            isInList = true;}
        const searched = await fetchSearchedTv(id);
        if(isInList){
            await List.findOneAndDelete({mid:id});
        }
        else
        {
            var obj = {title:searched.name,imlink:searched.poster_path,rating:searched.vote_average,desc:searched.overview,type:"tv",mid:id}
            const newList = new List(obj);
            await newList.save();
        }
        
        res.redirect(`/search/tv/${id}`);
    }
})

app.get('/mylist',async (req,res) =>{
    const list = await List.find({});
    res.render('mylist',{list});
})


app.listen(4000,() =>{
    console.log("serving on port 4000");
} )
