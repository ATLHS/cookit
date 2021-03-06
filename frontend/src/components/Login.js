import React, {useState, useEffect} from 'react';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import { Link, Redirect, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import '../css/Login.css';
import { setUserStorage } from './utils/Auth';
import FacebookLoginBtn from './layout/FacebookLoginBtn';
import GoogleLoginBtn from './layout/GoogleLoginBtn';
import Spinner from 'react-bootstrap/Spinner';
import Modal from 'react-bootstrap/Modal';

const Login = () => {
    let location = useLocation();
    const message = location.state;

    // Login message info
    const [response, setResponse] = useState();
    const [isLoading, setIsLoading] = useState(false);
    const [isloggedin, setIsloggedin] = useState(false);
    const [show, setShow] = useState();

    // Login form hook
    const { register, handleSubmit, errors } = useForm({
        defaultValues: {
            email: localStorage.getItem('email') || "",
            rememberMe: localStorage.getItem('rememberMe') || false
        }
    })

    // Reset password form hook
    const { register: register2, errors: errors2, handleSubmit: handleSubmit2 } = useForm();
    
    // handle password reset
    const handlePasswordReset = (data, e) => {
        fetch("/users/reset_password", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(data)
        })
        .then(response => response.json())
        .then(res => {
            setResponse(res);
            e.target.reset();
            closeModal()
        })
        .catch(err => console.log(err));
    }

    // handle login with provider
    const handleAuthProvider = response => {
        setIsLoading(true)
        const {email} = response.profileObj || response;

        fetch("/users/login/provider/auth", {
            method: "POST",
            headers: {
                'Content-Type': "application/json"
            },
            body: JSON.stringify({"email" : email})
        })
        .then(response => response.json())
        .then(res => {
            setIsLoading(false)
            if(!res.isAuth){
                setResponse(res.info)
            } else {
                setUserStorage(res.token, res.user);
                setIsloggedin(true);
            }
        })
        .catch(err => console.log(err));
    }
    // handle login
    const onSubmit = data => {
        fetch("/users/login", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(data)
        })
        .then(response => response.json())
        .then(res => {
            if(!res.isAuth){
                setResponse(res.info)
            } else {
                setUserStorage(res.token, res.user);
                setIsloggedin(true);
            }
        })
        .catch(err => console.log(err));
    };

    useEffect(() => {
        if (message) {
            setResponse(message)
        }
    
    }, [message])

    const openModal = () => setShow(true); 
    const closeModal = () => setShow(false); 
    
    return (
        <>
        {!isloggedin ? 
            !isLoading ?
            <Row className="m-0 bg-light">
                <Modal className="p-4 resetModal" show={show} onHide={closeModal} size="sm" centered>
                    <Form onSubmit={handleSubmit2(handlePasswordReset)}>
                        <h3 className="text-center">Forgot your password?</h3>
                        <p className="text-center">Enter the email address associated with your account, and we’ll email you a link to reset your password.</p>
                        <Form.Control name="email" type="email" ref={register2({ required: true })}></Form.Control>
                        {errors2.email && <small className="text-danger text-center d-block m-auto">This field is required</small>}
                        <Button className="loginCta border-0 mt-3" type="submit" block>Send reset link</Button>
                    </Form>
                </Modal>
                <Col md={5} className="loginWrapper">
                    <Row id="loginContainer" className="shadow row d-flex flex-column m-auto bg-white border-white rounded pl-3 pr-3 pt-4 pb-4 m-0">
                        <Col className="mb-3">
                            <h2 className="text-center m-auto">Login</h2>
                            {response && <p className={`${!response.isConfirm ? "text-danger" : "text-success"} text-center mb-0 mt-2`}>{response.message}</p>} 
                        </Col>
                        <Form onSubmit={handleSubmit(onSubmit)}>
                            <Form.Group style={{marginBottom: "0.3rem"}} controlId="formBasicEmail">
                                <Form.Label>Email</Form.Label>
                                <Form.Control className={errors.email && "is-invalid"} name="email" type="email" placeholder="Enter email" ref={register({required: true})}></Form.Control>
                                {errors.email && <small className="text-danger">Please choose a email.</small>}
                            </Form.Group>
                            <Form.Group controlId="formBasicEmail">
                                <Form.Label>Password</Form.Label>
                                <Form.Control className={errors.password && "is-invalid"} name="password" type="password" placeholder="Enter password" ref={register({required: true})}></Form.Control>
                                {errors.password && <small className="text-danger">Please enter a password.</small>}
                            </Form.Group>
                            <Form.Group className="pl-2 pr-2">
                                <Form.Row>
                                    <Form.Check 
                                        className="mr-auto"
                                        ref={register}
                                        name="rememberMe" 
                                        type="checkbox"
                                        label="Remember me?" 
                                    />
                                    <Button variant="link" className="text-right text-decoration-none p-0 border-0 ml-auto cookitColor" onClick={openModal}>Forgot password?</Button>
                                </Form.Row>
                            </Form.Group>
                            <Button className="loginCta border-0" type="submit" block>Login</Button>
                            <Row>
                                <Col><hr></hr></Col>
                                <p className="text-center mb-0">or</p>
                                <Col><hr></hr></Col>
                            </Row>
                            <FacebookLoginBtn responseFacebook={handleAuthProvider} />
                            <GoogleLoginBtn responseGoogle={handleAuthProvider} />
                        </Form>
                        <Col>
                            <p className="text-center mb-0 mt-3">Don't have an account? <Link className="cookitColor" to="/users/signup">Sign up</Link></p>
                        </Col>
                    </Row>
                </Col>
            </Row> 
            :  
            <Row className="m-auto loading">
                <Col className="text-center d-flex justify-content-center align-items-center">
                    <Spinner  animation="border" size="lg"/>
                </Col>
            </Row> 
            :
            <Redirect to="/dashboard" /> 
        }
        </>
    )
}

export default Login;