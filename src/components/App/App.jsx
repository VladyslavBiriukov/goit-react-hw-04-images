import { useState, useEffect } from 'react';

import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { fetchData } from 'components/Services/Api';
import SearchBar from 'components/SearchBar';
import ImageGallery from 'components/ImageGallery';
import Button from 'components/Button';
import Modal from 'components/Modal';
import Loader from 'components/Loader';
import Container from './App.styled';

function App()  {

  const [images, setImages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [query, setQuery] = useState('');
  const [error, setError] = useState(null);
  const [page, setPege] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [largeImageURL, setlargeImageURL] = useState(null);
  const [total, setTotal] = useState(0);
  const [tags, setTags] = useState('');


  useEffect(() => {
    if (!query) return;
    fetchImages(query, page);
  }, [query, page]);

  const fetchImages = (query, page) => {
    const perPage = 12;
    setIsLoading(true);

    fetchData(query, page, perPage).then(({ hits, totalHits }) => {
      const totalPages = Math.ceil(totalHits / perPage);

      const data = hits.map(({ id, webformatURL, largeImageURL, tags }) => {
        return {
          id,
          webformatURL,
          largeImageURL,
          tags,
        };
      });
      
      setImages((images) => [...images, ...data]);
      setTotal(totalHits);

      if (hits.length === 0) {
        return toast.error('Sorry, no images found. Please, try again!');
      }

      if (page === 1) {
        toast.success(`Hooray! We found ${totalHits} images.`);
      }

      if (page === totalPages) {
        toast.info("You've reached the end of search results.");
      }
    }).catch(error => setError(error)).finally(() => setIsLoading(false));

  };
  

   const handleSearch = query => {
     setQuery(query);
     setPege(1);
     setImages([]);
     setError(null);
  };

  const onLoadMore = () => {
    setPege(page => page + 1);
  };

  const toggleModal = largeImageURL => {
    setShowModal(!showModal);
    setlargeImageURL(largeImageURL);
    setTags(tags);
  };


    const loadImages = images.length !== 0;
    const isLastPage = images.length === total;
    const loadMoreBtn = loadImages && !isLoading && !isLastPage;

    return (
      <Container>
        <SearchBar onSubmit={handleSearch} />

        {error && toast.error(error.message)}

        {isLoading && <Loader />}

        {loadImages && (
          <ImageGallery images={images} onClick={toggleModal} />
        )}

        {loadMoreBtn && <Button onClick={onLoadMore}>Load more</Button>}

        {showModal && (
          <Modal onClose={toggleModal}>
            <img src={largeImageURL} alt={tags} />
          </Modal>
        )}

        <ToastContainer theme="colored" position="top-right" autoClose={3000} />
      </Container>
    );
};

export default App;