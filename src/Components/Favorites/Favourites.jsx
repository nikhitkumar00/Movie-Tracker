import React, { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import "./Favourites.css";
import Moviegrid from "../Moviegrid/Moviegrid";

const Favourites = () => {
  const [movies, setMovies] = useState([]);

  useEffect(() => {
    const fetchMovies = async () => {
      try {
        toast.dismiss();

        toast.promise(
          fetch('http://localhost/movietracker_backend/favourites.php')
            .then(response => response.json())
            .then(data => {
              const urls = data.map(imdbID => `http://www.omdbapi.com/?apikey=9027a6a0&i=${imdbID}`);
              return Promise.all(urls.map(url => fetch(url)))
                .then(responses => Promise.all(responses.map(response => response.json())));
            })
            .then(movieData => {
              setMovies(movieData);
              return movieData;
            }),
          {
            pending: 'Loading...',
            success: 'Movies fetched successfully!',
            error: 'Error fetching movies',
          }
        );
      } catch (error) {
        console.error('Error fetching movie data:', error);
        toast.error('Error fetching movie data');
      }
    };

    fetchMovies();
  }, []);

  const handleRemove = async (movieId) => {
    try {
      const response = await fetch(`http://localhost/movietracker_backend/removefavourite.php?movieId=${movieId}`);
      const data = await response.json();

      if (data.success) {
        toast.success('Movie removed successfully');

        const updatedMovies = movies.filter(movie => movie.imdbID !== movieId);
        setMovies(updatedMovies);
      } else {
        toast.error('Error removing movie');
      }
    } catch (error) {
      console.error('Error removing movie:', error);
      toast.error('Error removing movie');
    }
  };

  const handleWatched = async (movieId) => {
    try {
      const response = await fetch(`http://localhost/movietracker_backend/addwatched.php?movieId=${movieId}`);
      const data = await response.json();

      if (data.success) {
        toast.success('Movie marked as watched');

        const updatedMovies = movies.map(movie => {
          if (movie.imdbID === movieId) {
            return { ...movie, watched: true };
          }
          return movie;
        });
        setMovies(updatedMovies);
      } else {
        toast.error('Error marking movie as watched');
      }
    } catch (error) {
      console.error('Error marking movie as watched:', error);
      toast.error('Error marking movie as watched');
    }
  };

  return (
    <div className="favouriteWrapper">
      <Moviegrid
        movies={movies}
        button1={"Remove"}
        button2={"Watched"}
        onButton1Click={handleRemove}
        onButton2Click={handleWatched}
      />
    </div>
  );
};

export default Favourites;