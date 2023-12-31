import { useState, useEffect } from 'react'
import styles from './StageInfo.module.css'
import axios from 'axios'
import { useParams, useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux';
import { API_BASE_URL } from '../../constants';

function StageInfo() {

    const user = useSelector(state => state.user.user);
    const token = useSelector(state => state.user.token);
    const categoryMap = useSelector(state => state.category.categoryMap)
    
    const navigate = useNavigate()
    const { showId } = useParams();
    const [showData, setShowData] = useState(null);
    const [reservationNow, setReservationNow] = useState(false)
  
    useEffect(() => {
      const fetchData = async () => {
        try {
          const response = await axios.get(`${API_BASE_URL}/shows/${showId}`);
          console.log('ShowInfo:', response)
          setShowData(response.data);
        } catch (error) {
          console.error(error);
          navigate('/');
        }
      };
  
      fetchData();
    }, [showId]);

    const attendStage = () => {
        if(!token){
          alert('로그인 해주세요')
          navigate('/login')
          return;
        }
        navigate(`/stage/${showData.showId}`);
      }
    
      const reserveStage = async () => {
        if(!token){
          alert('로그인 해주세요')
          navigate('/login')
          return;
        }
        const headers = { 
          'Content-Type': 'application/json', 
          'Authorization': 'Bearer ' + token
        };
    
        try {
          const response = await axios.post(`${API_BASE_URL}/reservation/${showData.showId}`, {}, { headers });
          console.log(response)
          if (response.data) {
            alert('예약되었습니다!')
            setReservationNow(true)
          }else {
            alert('예약이 취소되었습니다.')
            setReservationNow(false)
          }
        } catch(error) {
          console.log(error)
        }
      }
    
      const startStage = async () => {
        try {
          // console.log(token);
          const res = await axios.put(`${API_BASE_URL}/shows/${showData.showId}/start`, {}, {
            headers: {
              'Content-Type': 'application/json', 
              'Authorization': 'Bearer ' + token
            }
          });
          // console.log(res.data);
          navigate(`/stage/${showData.showId}`);
        }
        catch (e) {
          console.log(e);
        }
      }

  return (
    <div className={styles.container}>
        <div className={styles.contentbox}>
            {showData ? (
            <div className={styles.content}>
                <div className={styles.left}>
                    <div className={styles.imgbox}>
                        <img src={showData.thumbnail} alt="Poster" className={styles.poster} />
                    </div>
                </div>
                <div className={styles.right}>
                    <div className={styles.infobox}>
                        <p className={styles.title}>{showData.title}</p>
                        <p className={styles.category}>공연 분류 : {categoryMap[showData.category_id].categoryName}</p>
                        <p className={styles.performer}>공연자 : {showData.nickname}</p>
                        <p className={styles.description}>공연 설명 : {showData.description}</p>
                        <p className={styles.price}>가격 : {showData.price}원</p>
                        <p className={styles.audiencelimit}>관객 제한: {showData.attendanceLimit}명</p>
                    {showData.showProgress === 'SCHEDULED' ? (
                        user && user.nickname ? (
                            showData.nickname !== user.nickname ? (
                            <button onClick={reserveStage} className={`${reservationNow? styles.redbutton: styles.submitbutton}`}>예약하기</button>
                        ) : (
                            <button onClick={startStage} className={styles.submitbutton}>시작하기</button>
                        )
                        ) : (
                        <button onClick={reserveStage} className={`${reservationNow? styles.redbutton: styles.submitbutton}`}>예약하기</button> // user 객체가 null인 경우 기본 동작
                        )
                    ) : (
                        <button onClick={attendStage} className={styles.submitbutton}>입장하기</button>
                    )}
                    </div>
                </div>
            </div>
        ) : (
            <p>Loading...</p>
        )}
        </div>
    </div>
  )
}

export default StageInfo