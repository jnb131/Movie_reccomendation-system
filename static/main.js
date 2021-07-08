$(function() {
	$('.results').css('display','none');
  	console.log("unnamed function called");
  	// Button will be disabled until we type anything inside the input field
  	const search_bar = document.getElementById('autoComplete');
  	const inputHandler = function(e) {
		if(e.target.value==""){
			$('.movie-button').attr('disabled', true);
		} else{
			$('.movie-button').attr('disabled', false);
		}
  	}
	search_bar.addEventListener('input', inputHandler);
  	$('.movie-button').on('click',function() {
    	let my_api_key = '15d2ea6d0dc1d476efbca3eba2b9bbfb';
    	let title = $('.movie').val();
    	if (title == "") {
			$('.results').css('display','none');
      		$('.fail').css('display','block');
    	} else {
      		load_details(my_api_key,title);
    	}
  	});

	const reset_button_event_listener = function(e) {
		$('.results').css('display','none');
		$('.movie-button').attr('disabled', true);
		$('.reset-button').attr('disabled', true);
		search_bar.value = '';
	};
	$('.reset-button').on('click', reset_button_event_listener);
});

// will be invoked when clicking on the recommended movies
function recommend_card(e){
	console.log("recommendcard function invoked")
  	let my_api_key = '15d2ea6d0dc1d476efbca3eba2b9bbfb';
  	let title = e.getAttribute('title'); 
  	load_details(my_api_key,title);
}

// get the basic details of the movie from the API (based on the name of the movie)
function load_details(my_api_key,title){
  	$.ajax({
    	type: 'GET',
    	url:'https://api.themoviedb.org/3/search/movie?api_key='+my_api_key+'&query='+title,

    	success: function(movie){
      		if(movie.results.length < 1){
        		$('.fail').css('display','block');
        		$('.results').css('display','none');
        		console.log("loader_fading_out");
				$("#loader").delay(500).fadeOut();
      		} else {
				console.log("loader_fading_in");
        		$("#loader").fadeIn();
        		$('.fail').css('display','none');
        		
        		let movie_id = movie.results[0].id;
        		let movie_title = movie.results[0].original_title;
				$('.reset-button').attr('disabled', false);
        		movie_recs(movie_title,movie_id,my_api_key);
      		}
    	},
    	error: function(){
      		alert('Invalid Request');
      		$("#loader").delay(500).fadeOut();
    	},
  	});
}

// get movie recommendations 
function movie_recs(movie_title, movie_id, my_api_key){
  	$.ajax({
    	type: 'POST',
    	url: "/similarity",
    	data: {'name': movie_title},
    	success: function(recs){
      		if(recs=="Sorry! The movie you requested is not in our database. Please check the spelling or try with some other movies"){
        		$('.fail').css('display','block');
        		$('.results').css('display','none');
        		$("#loader").delay(500).fadeOut();
      		} else {
        		$('.fail').css('display','none');
        		$('.results').css('display','block');
        		let movie_arr = recs.split('---');
				console.log(movie_arr);
        		let rearr = [];
				rearr.push()
        		for(const i in movie_arr) {
          			rearr.push(movie_arr[i]);
        		}
        		render_movie_cards(movie_title, movie_id, my_api_key, rearr);
      		}
    	},
   		error: function(){
      		alert("error recs");
      		$("#loader").delay(500).fadeOut();
    	},
  	}); 
}

// get all the details of the movie using the movie id.
function render_movie_cards(movie_title, movie_id, my_api_key, rearr) {
	let element_key_list = ["", "-1", "-2", "-3", "-4", "-5"];
	let type_list = ["searched", "recommended", "recommended", "recommended", "recommended", "recommended"];
	for (let i in rearr) {
		populate_card(rearr[i], my_api_key, type_list[i], element_key_list[i]);
	}

	$('.results').delay(1000).css('display','block');
	$("#loader").delay(500).fadeOut();
}



// function that populates a card element
function populate_card(movie_name, my_api_key, type, element_key) {
	let my_url = 'https://api.themoviedb.org/3/search/movie?api_key='+my_api_key+'&query='+movie_name;
	console.log(my_url);
	$.ajax({
		type: 'GET',
		url:'https://api.themoviedb.org/3/search/movie?api_key='+my_api_key+'&query='+movie_name,
		
		success: function(movie){
			if(movie.results.length<1){
			} else {
				let movie_id = movie.results[0].id;
				let movie_title = movie.results[0].original_title;
				let poster_path = movie.results[0].poster_path;
				let movie_desciption = movie.results[0].overview;
				let recommended_movie_card_image_element = document.getElementById(type + "-movie-poster" + element_key);
				let image_url = "http://image.tmdb.org/t/p/w500/" + poster_path;
				console.log(image_url);
				recommended_movie_card_image_element.setAttribute("src", image_url);
				let recommended_movie_title_element = document.getElementById(type + "-movie-title" + element_key);
				recommended_movie_title_element.innerText = movie_title;
				let recommended_movie_description_element = document.getElementById(type + "-movie-description" + element_key);
				recommended_movie_description_element.innerText = movie_desciption;
				populate_genre(movie_id, my_api_key, type, element_key);
			}
		},
		error: function(){
			alert('Invalid Request');
		},
	});
}


function populate_genre(movie_id, my_api_key, type, element_key) {
	let my_url = "https://api.themoviedb.org/3/movie/" + movie_id + "?api_key=" + my_api_key;
	console.log("MOVIE DETAILS (Genre) : " + my_url);
	$.ajax({
		type: "GET",
		url: "https://api.themoviedb.org/3/movie/" + movie_id + "?api_key=" + my_api_key,
		
		success: function(movie_details) {
			let genres_list = [];
			console.log("genre_list : " , movie_details["genres"]);
			for (let item in movie_details["genres"]) {
				let genre = movie_details["genres"][item]["name"];
				console.log("item : " + genre);
				genres_list.push(genre);
			}
			let recommended_movie_genre_element = document.getElementById(type + "-movie-genres" + element_key);
			let genre_string = genres_list.join(", ");
			genre_string = "Genres: " + genre_string;
			recommended_movie_genre_element.innerText = genre_string;
			
		},
		error: function() {
			alert('Invalid Request');
		},
	});
}
