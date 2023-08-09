import { useState, useEffect } from 'react';
import Button from 'react-bootstrap/Button';
import Container from 'react-bootstrap/Container';
import Form from 'react-bootstrap/Form';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import Offcanvas from 'react-bootstrap/Offcanvas';
import { useSelector } from 'react-redux';
import { useDispatch } from 'react-redux';
import { logOut } from '../../redux/userSlice';
import { useNavigate } from 'react-router-dom';
import axios from 'axios'

import { HiOutlineSearch } from "react-icons/hi";
import './Header.css'
import { API_BASE_URL } from '../../constants';

function Header() {
  const [expand, setExpand] = useState(null);
  const token = useSelector((state) => state.user.token)
  const user = useSelector((state) => state.user.user)
  const [word, setWord] = useState('');
  const [isOffcanvasOpen, setIsOffcanvasOpen] = useState(false);

  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      let newExpand = null;
      if (width < 576) newExpand = 'sm';
      else if (width < 768) newExpand = 'md';
      else if (width < 992) newExpand = 'lg';
      else if (width < 1200) newExpand = 'xl';
      else newExpand = 'xxl';
      setExpand(newExpand);
    };

    handleResize();

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  const deleteAccount = async (event) => {
    event.preventDefault();
    const config = {
      headers: {
        'Content-Type': 'application/json', 
        'Authorization': `Bearer ${token}`
      }
    };
    try {
      const response = await axios.delete(`${API_BASE_URL}/user/withdrawal`, config);
      dispatch(logOut())
      console.log('Check success:', response);

    } catch (error) {
      console.log('Check error', error);
    }
  };
  
  const wordChange = (e) => {
    setWord(e.target.value);
  }
  
  const toggleOffcanvas = () => {
    setIsOffcanvasOpen(prev => !prev);
  };

  const toProfile = () => {
    navigate(`/mypage/${user.nickname}`)
  }

  const searchWord = async (event) => {
    event.preventDefault();
    console.log(word)
    try {
      setIsOffcanvasOpen(false)
      navigate(`/search/${word}`, {replace:true});
    } catch (error) {
      console.log(error)
    }
  }


  return (
    <div>
      <Navbar 
      style={{ background: "#1a1b1e", color: "white"}} 
      expand={expand}
    >
      <Container fluid>
        <Navbar.Brand 
          href="/" 
          style={{ color: "white", fontWeight: "bold", fontSize: "2rem" }}
          className='logotext'
        >
          Immerse
        </Navbar.Brand>
        <Navbar.Toggle 
          style={{ color: "white", background:"white"}} 
          aria-controls="offcanvasNavbar" 
          onClick={toggleOffcanvas}
        />
        <Navbar.Offcanvas
          show={isOffcanvasOpen}
          onHide={toggleOffcanvas}
          style={{ color: "white", background:"#1a1b1e"}}
          id="offcanvasNavbar"
          aria-labelledby="offcanvasNavbarLabel"
          placement="end"
        >
            <Offcanvas.Header closeButton style={{ color: "#31363B", background:"#1a1b1e"}}>
              <Offcanvas.Title style={{ color: "white", fontWeight: "bold", fontSize: "2rem" }} id="offcanvasNavbarLabel">Immerse</Offcanvas.Title>
            </Offcanvas.Header>
            <Offcanvas.Body>
              
              <Nav className="justify-content-end flex-grow-1 pe-3" style={{ whiteSpace: "nowrap" }}>
                
              <Form className="d-flex m-2" onSubmit={searchWord}>
                <Form.Control
                  type="search"
                  placeholder="Search"
                  className="me-2"
                  aria-label="Search"
                  value={word}
                  onChange={wordChange}
                />
                <Button variant="outline-light" type='button' onClick={searchWord}>
                    <HiOutlineSearch />
                </Button>
              </Form>

              {token ? (
                <>
                  <Nav.Link
                    className='m-2' style={{ color: 'white'}}
                    onClick={() => {dispatch(logOut());}}
                  >
                    LogOut
                  </Nav.Link>
                  <Nav.Link onClick={toProfile} className='m-2' style={{ color: "white" }}>
                    Profile
                  </Nav.Link>
                  <Nav.Link className='m-2' style={{ color: "white" }}
                    onClick={deleteAccount}
                  >
                    DeleteAccount
                  </Nav.Link>
                </>
              ) : (
                <>
                  <Nav.Link href="/login" className='m-2' style={{ color: "white" }}>
                    LogIn
                  </Nav.Link>
                  <Nav.Link href="/signup" className='m-2' style={{ color: "white" }}>
                    SignUp
                  </Nav.Link>
                </>
              )}
              </Nav>
            </Offcanvas.Body>
          </Navbar.Offcanvas>
        </Container>
      </Navbar>
    </div>
  );
}

export default Header;
