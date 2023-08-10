// import React from 'react'
import { useEffect, useState, useRef, useCallback } from 'react';
import styles from './Stage.module.css'

import { OpenVidu } from 'openvidu-browser';

import axios from 'axios';
import { useParams } from 'react-router';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { API_BASE_URL } from '../../constants';
import { Audience, Performer, Loading } from './components';
import { Button } from 'react-bootstrap';

const Stage = () => {
    const { id } = useParams(); // session id는 show_id로 설정 (겹치는 일이 없도록!)
    const navigate = useNavigate();

    const ov = useRef(new OpenVidu()); 
    const [subscribers, setSubscribers] = useState([]);
    const [publisher, setPublisher] = useState(undefined);
    const [mainStreamManager, setMainStreamManager] = useState(undefined);
    const [session, setSession] = useState(undefined);
    const [showData, setShowData] = useState({});

    const userToken = useSelector((state) => state.user.token);
    const user = useSelector(state => state.user.user);

    const isAuthor = () => user.nickname === showData.nickname; 

    const getToken = async () => {
        try {
            const sessionId = await createSession(id);
            return await createToken(sessionId);
        }
        catch (e) {
            console.log(e);
            throw e;
        }
    }

    const createSession = async (sessionId) => {
        try {
            console.log('token: ' + userToken);
            const response = await axios.post(API_BASE_URL + '/rooms/', {
                    customSessionId: sessionId
                }, {
                headers: { 
                    'Content-Type': 'application/json', 
                    'Authorization': 'Bearer ' + userToken
                },
            });
            console.log(response.data);
            return response.data; // The sessionId
        }
        catch (e) {
            console.log(e);
            throw e;
        }
    }

    const createToken = async (sessionId) => {
        try {
            const response = await axios.post(`${API_BASE_URL}/rooms/${sessionId}/connect`, {}, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + userToken
                },
            });
            console.log(response.data);
            return response.data; // The token
        }
        catch (e) {
            console.log(e);
        }
    }

    const addSubscriber = (streamManager) => {
        const nickname = JSON.parse(streamManager.stream.connection.data).clientData;

        if (nickname === showData.nickname) setMainStreamManager(streamManager);
        else setSubscribers(subscribers => [...subscribers, streamManager]);
    }

    const deleteSubscriber = useCallback(streamManager => {
        const nickname = JSON.parse(streamManager.stream.connection.data).clientData;
        if (nickname === showData.nickname) {
            setMainStreamManager(undefined);
        }
        else {
            setSubscribers(prevSubcsribers => {
                const index = prevSubcsribers.indexOf(streamManager, 0);
                if (index > -1) {
                    const ls = [...prevSubcsribers];
                    ls.splice(index, 1);
                    return ls;
                }
                return prevSubcsribers;
            });
        }
    }, []);

    const joinSession = () => {
        const newSession = ov.current.initSession();

        // On every new Stream received...
        newSession.on('streamCreated', (event) => {
            // Subscribe to the Stream to receive it. Second parameter is undefined
            // so OpenVidu doesn't create an HTML video by its own
            const subscriber = newSession.subscribe(event.stream, undefined);
            addSubscriber(subscriber);
        });

        // On every Stream destroyed...
        newSession.on('streamDestroyed', (event) => {
            // Remove the stream from 'subscribers' array
            deleteSubscriber(event.stream.streamManager);
        });

        // On every asynchronous exception...
        newSession.on('exception', (exception) => {
            console.warn(exception);
        });

        getToken().then((token) => {
            newSession
            .connect(token, { clientData: user.nickname })
            .then(async () => {

                // Init a publisher passing undefined as targetElement (we don't want OpenVidu to insert a video
                // element: we will manage it on our own) and with the desired properties
                let newPublisher = await ov.current.initPublisherAsync(undefined, {
                    audioSource: undefined, // The source of audio. If undefined default microphone
                    videoSource: undefined, // The source of video. If undefined default webcam
                    publishAudio: true, // Whether you want to start publishing with your audio unmuted or not
                    publishVideo: true, // Whether you want to start publishing with your video enabled or not
                    resolution: '640x480', // The resolution of your video
                    frameRate: 30, // The frame rate of your video
                    insertMode: 'APPEND', // How the video is inserted in the target element 'video-container'
                    mirror: false, // Whether to mirror your local video or not
                });

                newSession.publish(newPublisher);

                // Obtain the current video device in use
                var devices = await ov.current.getDevices();
                var videoDevices = devices.filter(device => device.kind === 'videoinput');
                var currentVideoDeviceId = newPublisher.stream.getMediaStream().getVideoTracks()[0].getSettings().deviceId;
                var currentVideoDevice = videoDevices.find(device => device.deviceId === currentVideoDeviceId);

                addSubscriber(newPublisher);
                setSession(newSession);
            })
            .catch((error) => {
                console.log('There was an error connecting to the session:', error.code, error.message);
            });
        });
    }

    const leaveSession = useCallback(() => {
        console.log('--------leave--------');
        if (session) {
            session.disconnect();
        }
        ov.current = new OpenVidu();
        setSession(undefined);
        setSubscribers([]);
        setMainStreamManager(undefined);
        setPublisher(undefined);

        const fetch = async () => {
            try {
                const response = await axios.post(`${API_BASE_URL}/rooms/${id}/${isAuthor() ? 'terminate' : 'disconnect'}`, {}, {
                    headers: { 
                        'Content-Type': 'application/json',
                        'Authorization': 'Bearer ' + userToken
                    },
                });
                console.log(response.data);

                if (isAuthor()) {
                    const res = await axios.put(`${API_BASE_URL}/shows/${id}/finish`, {}, {
                        headers: { 
                            'Content-Type': 'application/json',
                            'Authorization': 'Bearer ' + userToken
                        },
                    });
                    console.log(res.data);
                }

                // setShowData({});
                return response.data; // NO CONTENT
            }
            catch (e) {
                console.log(e);
            }
        }
        fetch();
    }, [session]);

    const muteAllCams = () => {
        for (const e of subscribers) {
            const nickname = JSON.parse(e.stream.connection.data).clientData;
        
            // ov.getCameras(user.user_id);
        }
    }

    const popState = () => {
        leaveSession();
        navigate(-1);
    }

    const fetchData = async () => {
        const response = await axios.get(`${API_BASE_URL}/shows/${id}`, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + userToken
            }
        });
        console.log(response.data);
        setShowData(response.data);
        // joinSession(false); // 방에 들어오면 바로 시작. 임시로 false 할당
    }
    
    useEffect(() => {
        fetchData();
    }, []);

    useEffect(() => {
        if (showData.user_id)
            joinSession();
    }, [showData.user_id]); // showData를 불러왔을 때만 딱 한 번 joinSession을 자동으로 호출

    useEffect(() => {
        const handleBeforeUnload = (event) => {
            event;
            leaveSession();
        }
        window.addEventListener('beforeunload', handleBeforeUnload);
        // window.addEventListener('popstate', handleBeforeUnload);
        window.onpopstate = handleBeforeUnload;

        return () => {
            window.removeEventListener('beforeunload', handleBeforeUnload);
            // window.removeEventListener('popstate', handleBeforeUnload);
            // window.onpopstate = () => {}; 
        }
    }, [leaveSession]);

    return (
        <div className={styles.container}>
            {session !== undefined ?
                isAuthor() ? 
                    <Performer
                    publisher={publisher}
                    mainStreamManager={mainStreamManager}
                    subscribers={subscribers}
                    /> :
                    <Audience 
                    publisher={publisher}
                    mainStreamManager={mainStreamManager}
                    subscribers={subscribers}
                    leaveSession={popState}
                    />  
                : <Loading showData={showData} />}
            {/* <Button onClick={muteAllCams}>Mute</Button> */}
        </div>
    );
}

export default Stage;