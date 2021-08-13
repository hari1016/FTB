const express = require('express');
const app= express();
const path = require('path');
const ejsmate = require('ejs-mate');
const fetch = require('node-fetch');
const session = require('express-session');
const flash =  require('connect-flash');
const passport = require('passport');
const LocalStrategy = require('passport-local');
const mongoose = require('mongoose');
const Review = require('./models/reviews');
const Rating = require('./models/rating');
const List = require('./models/mylist');
const User = require('./models/userdetails');
const { response } = require('express');


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

const sessionConfig = {
    secret: 'notasecret',
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true,
        expires: Date.now() + 1000 * 60 * 60
    } 
}
app.use(session(sessionConfig));
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req,res,next)=>{
    res.locals.currentUser = req.user;
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    next();
})

const isLoggedIn = (req,res,next) => {
    if(!req.isAuthenticated()){
        req.flash('error','Please log in first!');
        res.redirect('/login');
    }
    next();
}


app.get('/signup',async (req,res) => {
    res.render("sign up");
})
app.get('/login',async (req,res) => {
    res.render("login");
})

app.post('/signup',async (req,res) => {
    try{
        const {username,email,password,address,city,state,zip} = req.body;
        const user = User({username,email,password,address,city,state,zip});
        const registeredUser = await User.register(user,password);
        req.flash('success',"Successfully created user! Now login to continue.");
        res.redirect('/login');
    }
    catch(e){
        req.flash('error',e.message);
        res.redirect('/signup');
    }
})
app.post('/login', passport.authenticate('local', { failureFlash : true , failureRedirect : '/login'}) ,async (req,res) => {
    res.redirect('/');
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
    const response = await fetch('https://api.themoviedb.org/3/discover/tv?api_key=05abd9d0f24c5b1dcd75fc9794dd1811&vote_count.gte=60&with_networks=213&release_date.lte=Date.now()'); 
    popular = await response.json();  
    return popular.results.slice(0,5);
} 
async function fetchTopRated(){ 
    const response = await fetch('https://api.themoviedb.org/3/movie/top_rated?api_key=05abd9d0f24c5b1dcd75fc9794dd1811'); 
    topRated = await response.json();  
    return topRated.results.slice(2,7);
} 
async function fetchNewComedy(){ 
    const response = await fetch('https://api.themoviedb.org/3/discover/movie?api_key=05abd9d0f24c5b1dcd75fc9794dd1811&with_genres=35'); 
    newComedy = await response.json();  
    return newComedy.results.slice(0,5);
} 

app.get('/',async (req,res) => {
        const trending = await fetchTrending();
        const popular = await fetchPopular();
        const topRated = await fetchTopRated();
        const random = await fetchRandom();
        const comedy = await fetchNewComedy();
        res.render('home',{trending,popular,topRated,random,comedy});
})

async function fetchActionMovies(){ 
    const response = await fetch('https://api.themoviedb.org/3/discover/movie?api_key=05abd9d0f24c5b1dcd75fc9794dd1811&with_genres=28&sort_by=vote_count.desc'); 
    ActionMovies = await response.json();  
    return ActionMovies.results.slice(0,10);
} 
async function fetchComedyMovies(){ 
    const response = await fetch('https://api.themoviedb.org/3/discover/movie?api_key=05abd9d0f24c5b1dcd75fc9794dd1811&with_genres=35&sort_by=popularity.desc'); 
    ComedyMovies = await response.json();  
    return ComedyMovies.results.slice(0,10);
} 
async function fetchHorrorMovies(){ 
    const response = await fetch('https://api.themoviedb.org/3/discover/movie?api_key=05abd9d0f24c5b1dcd75fc9794dd1811&with_genres=27&sort_by=popularity.desc'); 
    horrorMovies = await response.json();  
    return horrorMovies.results.slice(0,10);
} 
async function fetchPopularMovies(){ 
    const response = await fetch('https://api.themoviedb.org/3/movie/popular?api_key=05abd9d0f24c5b1dcd75fc9794dd1811&sort_by=release_date.desc'); 
    popularMovies = await response.json();  
    return popularMovies.results.slice(0,5);
} 
app.get('/movies',async (req,res) =>{
    const actionMovies = await fetchActionMovies();
    const popularMovies = await fetchPopularMovies();
    const comedyMovies = await fetchComedyMovies();
    const horrorMovies = await fetchHorrorMovies();
    res.render('movies',{actionMovies,popularMovies,comedyMovies,horrorMovies});
})


async function fetchTrendingTv(){ 
    const response = await fetch('https://api.themoviedb.org/3/trending/tv/day?api_key=05abd9d0f24c5b1dcd75fc9794dd1811'); 
    trendingTv = await response.json();  
    return trendingTv.results.slice(0,5);
} 
async function fetchFantasyTv(){
    const response = await fetch('https://api.themoviedb.org/3/discover/tv?api_key=05abd9d0f24c5b1dcd75fc9794dd1811&sort_by=popularity.desc&with_genres=10765'); 
    fantasyTv = await response.json();
    return fantasyTv.results.slice(0,10);
}
async function fetchActionTv(){
    const response = await fetch('https://api.themoviedb.org/3/discover/tv?api_key=05abd9d0f24c5b1dcd75fc9794dd1811&sort_by=popularity.desc&with_genres=9648'); 
    actionTv = await response.json();
    return actionTv.results.slice(0,10);
}
async function fetchAnimationTv(){
    const response = await fetch('https://api.themoviedb.org/3/discover/tv?api_key=05abd9d0f24c5b1dcd75fc9794dd1811&sort_by=popularity.desc&with_genres=16'); 
    animationTv = await response.json();
    return animationTv.results.slice(0,5);
}
async function fetchCrimeTv(){
    const response = await fetch('https://api.themoviedb.org/3/discover/tv?api_key=05abd9d0f24c5b1dcd75fc9794dd1811&with_genres=80&sort_by=vote_count.desc'); 
    crimeTv = await response.json();
    return crimeTv.results.slice(0,10);
}
app.get('/tvshows',async (req,res) =>{
    const trendingTv = await fetchTrendingTv();
    const fantasyTv = await fetchFantasyTv();
    const actionTv = await fetchActionTv();
    const animationTv = await fetchAnimationTv();
    const crimeTv = await fetchCrimeTv();
    res.render('tvshows',{trendingTv,fantasyTv,actionTv,crimeTv,animationTv});
})

async function fetchRecommended(list){
    let recommended = [];
    for(let movie of list){
        const mid = movie.mid;
        if(movie.type == "movie"){
            const response = await fetch(`https://api.themoviedb.org/3/movie/${mid}/similar?api_key=05abd9d0f24c5b1dcd75fc9794dd1811`);
            reco = await response.json(); 
            recommended.push(reco.results[0]);  
        }
        else{
            const response = await fetch(`https://api.themoviedb.org/3/tv/${mid}/similar?api_key=05abd9d0f24c5b1dcd75fc9794dd1811`); 
            reco = await response.json(); 
            recommended.push(reco.results[0]); 
        }
    } 
    return recommended;
}
app.get('/recommendations',  isLoggedIn ,async (req,res) =>{
    const id = req.user.id;
    const list = await List.find({user: id});
    if(list.length < 10){
        req.flash('error',"You need atleast 10 movies/TV shows in your list!")
        res.redirect('/');
    }
    const recommended = await fetchRecommended(list);
    res.render('recommendations',{recommended});
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
async function fetchsimilarMovie(id){
    const response = await fetch(`https://api.themoviedb.org/3/movie/${id}/similar?api_key=05abd9d0f24c5b1dcd75fc9794dd1811`); 
    similar = await response.json();
    return similar.results.slice(0,5);
}
async function fetchsimilarTv(id){
    const response = await fetch(`https://api.themoviedb.org/3/tv/${id}/similar?api_key=05abd9d0f24c5b1dcd75fc9794dd1811`); 
    similar = await response.json();
    return similar.results.slice(0,5);
}
app.get('/search/movie/:id', isLoggedIn ,async (req,res) =>{
    const { id }=req.params;
    const reviews = await Review.find({mid:id}).populate('user');
    const inList = await List.find({mid:id,user: req.user.id});
    const rating = await Rating.find({mid:id})
    let sum=0,len = rating.length;
    for(r of rating){
        sum = sum + r.rating;
    }
    var isInList;
    if(Object.keys(inList).length === 0){
        isInList = false;}
    else{
        isInList = true;}
    const searched = await fetchSearchedMovie(id);
    const similar = await fetchsimilarMovie(id);
    res.render('details',{searched,reviews,isInList,similar,sum,len});
})
app.get('/search/tv/:id', isLoggedIn ,async (req,res) =>{
    const { id }=req.params;
    const reviews = await Review.find({mid:id}).populate('user');
    const inList = await List.find({mid:id,user: req.user.id});
    const rating = await Rating.find({mid:id})
    let sum=0,len = rating.length;
    for(r of rating){
        sum = sum + r.rating;
    }
    var isInList;
    if(Object.keys(inList).length === 0){
        isInList = false;}
    else{
        isInList = true;}
    const searched = await fetchSearchedTv(id);
    const similar = await fetchsimilarTv(id);
    res.render('details',{searched,reviews,isInList,similar,sum,len});
})

app.post('/search/movie/:id', isLoggedIn ,async (req,res) =>{
    if(Object.keys(req.body).length !== 0)
    {
    const { id }=req.params;
    var obj = req.body;
    obj.mid = id;
    obj.user = req.user._id;
    const newReview = new Review(req.body);
    await newReview.save();
    res.redirect(`/search/movie/${id}`);
    }
    else{
        const { id }=req.params;
        const inList = await List.find({mid:id,user: req.user.id});
        var isInList;
        if(Object.keys(inList).length === 0){
            isInList = false;}
        else{
            isInList = true;}
        const searched = await fetchSearchedMovie(id);
        if(isInList){
            await List.findOneAndDelete({mid:id,user: req.user.id});
            req.flash('success',"Movie removed from your list!")
        }
        else{
            var obj = {title:searched.title,imlink:searched.poster_path,rating:searched.vote_average,desc:searched.overview,type:"movie",mid:id};
            obj.user = req.user.id;
            const newList = new List(obj);
            await newList.save();
            req.flash('success',"Movie added to your list!");
        }
        res.redirect(`/search/movie/${id}`);
    }
})
app.post('/search/tv/:id', isLoggedIn ,async (req,res) =>{
    if(Object.keys(req.body).length !== 0)
    {
    const { id }=req.params;
    var obj = req.body;
    obj.mid = id;
    obj.user = req.user._id;
    const newReview = new Review(req.body);
    await newReview.save();
    res.redirect(`/search/tv/${id}`);
    }
    else{
        const { id }=req.params;
        const inList = await List.find({mid:id,user: req.user.id});
        var isInList;
        if(Object.keys(inList).length === 0){
            isInList = false;}
        else{
            isInList = true;}
        const searched = await fetchSearchedTv(id);
        if(isInList){
            await List.findOneAndDelete({mid:id,user: req.user.id});
            req.flash('success',"Tv show removed from your list!")
        }
        else
        {
            var obj = {title:searched.name,imlink:searched.poster_path,rating:searched.vote_average,desc:searched.overview,type:"tv",mid:id}
            obj.user = req.user.id;
            const newList = new List(obj);
            await newList.save();
            req.flash('success',"Tv show added to your list!")
        }
        res.redirect(`/search/tv/${id}`);
    }
})
app.post('/rating/movie/:id', isLoggedIn ,async (req,res) =>{
    const { id } = req.params;
    const rating = req.body;
    rating.mid = id;
    rating.user = req.user.id;
    const check = await Rating.find({mid:id,user: req.user.id})
    if(check.length){
        await Rating.findOneAndDelete({mid:id,user: req.user.id})
    }
    const newRating = new Rating(rating);
    await newRating.save();
    req.flash('success',"Your rating has been saved");
    res.redirect(`/search/movie/${id}`);
})
app.post('/rating/tv/:id', isLoggedIn ,async (req,res) =>{
    const { id } = req.params;
    const rating = req.body;
    rating.mid = id;
    rating.user = req.user.id;
    const check = await Rating.find({mid:id,user: req.user.id})
    console.log(check)
    if(check.length){
        await Rating.findOneAndDelete({mid:id,user: req.user.id});
        
    }
    const newRating = new Rating(rating);
    await newRating.save();
    req.flash('success',"Your rating has been saved");
    res.redirect(`/search/tv/${id}`);
})

app.get('/mylist', isLoggedIn ,async (req,res) =>{
    const id = req.user.id;
    const list = await List.find({user: id});
    res.render('mylist',{list});
})

app.get('/searched',async (req,res) => {
    const query = req.query.q;
    const response = await fetch(`https://api.themoviedb.org/3/search/multi?api_key=05abd9d0f24c5b1dcd75fc9794dd1811&query=${query}`);
    searched = await response.json();
    search = searched.results;
    res.render('search',{search,query});
})

app.get('/logout',(req,res) =>{
    req.logout();
    res.redirect('/');
})


app.listen(4000,() =>{
    console.log("serving on port 4000");
} )
