import React, { useContext, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { AppContext } from '../context/AppContext';
import { assets } from '../assets/assets';

const Appointment = () => {
  const { docId } = useParams();
  const { doctors, currencySymbol } = useContext(AppContext);
  const daysOfWeek = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
  
  const [docInfo, setDocInfo] = useState(null);
  const [loading, setLoading] = useState(true); // Loading state
  const [docSlots, setDocSlots] = useState([]); // Initialize slots
  const [slotIndex, setSlotIndex] = useState(0);
  const [slotTime, setSlotTime] = useState('');

  const fetchDocInfo = () => {
    const foundDocInfo = doctors.find(doc => doc._id === docId);
    setDocInfo(foundDocInfo);
    setLoading(false); // Stop loading after fetching
  };

  const getAvailableSlots = async () => {
    setDocSlots([]);

    // Getting current date
    let today = new Date();

    for (let i = 0; i < 7; i++) {
      // Getting date with index 
      let currentDate = new Date(today);
      currentDate.setDate(today.getDate() + i);

      // Setting end time of the date with index
      let endTime = new Date(currentDate);
      endTime.setHours(21, 0, 0, 0);

      // Setting hours 
      if (today.getDate() === currentDate.getDate()) {
        currentDate.setHours(currentDate.getHours() > 10 ? currentDate.getHours() + 1 : 10);
        currentDate.setMinutes(currentDate.getMinutes() > 30 ? 30 : 0);
      } else {
        currentDate.setHours(10);
        currentDate.setMinutes(0);
      }

      let timeSlots = [];

      while (currentDate < endTime) {
        let formattedTime = currentDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

        // Add slot to array 
        timeSlots.push({
          datetime: new Date(currentDate),
          time: formattedTime,
        });

        // Increment time by 30 min
        currentDate.setMinutes(currentDate.getMinutes() + 30);
      }

      setDocSlots(prev => [...prev, timeSlots]);
    }
  };

  useEffect(() => {
    if (doctors.length > 0) {
      fetchDocInfo();
    }
  }, [doctors, docId]);

  useEffect(() => {
    if (docInfo) {
      getAvailableSlots();
    }
  }, [docInfo]);

  useEffect(() => {
    console.log(docSlots);
  }, [docSlots]);

  if (loading) return <div>Loading...</div>; // Loading indicator
  if (!docInfo) return <div>Doctor not found.</div>; // Fallback if no doctor found

  return (
    <div>
      {/* --------doc detail --------- */}
      <div className='flex flex-col sm:flex-row gap-4'>
        <div className='flex-none'>
          <img 
            className='bg-primary w-full sm:max-w-72 rounded-lg' 
            src={docInfo.image} 
            alt={docInfo.name || "Doctor's profile picture"} // Ensure meaningful alt text
          />
        </div>
        <div className='flex-1 border border-grey-400 rounded-lg p-8 py-7 bg-white mx-2 sm:mx-0'>
          {/* -----doc info---- */}
          <p className='flex items-center gap-2 text-2xl font-medium text-gray-900'>
            {docInfo.name}
            <img className='w-5' src={assets.verified_icon} alt="Verified Icon" />
          </p>

          <div className='flex items-center gap-2 text-sm mt-1 text-gray-600'>
            <p>{docInfo.degree} - {docInfo.speciality}</p>
            <button className='py-0.5 px-2 border text-xs rounded-full'>{docInfo.experience}</button>
          </div>

          {/* ------doc about------- */}
          <div>
            <p className='flex items-center gap-1 text-sm font-medium text-gray-900 mt-3'>
              About <img src={assets.info_icon} alt="Info Icon" />
            </p>
            <p className='text-sm text-gray-500 max-w-[700px] mt-1'>{docInfo.about}</p>
          </div>

          <p className='text-gray-500 font-medium mt-4'> 
            Appointment fee: <span className='text-gray-600'>{currencySymbol}{docInfo.fees}</span>  
          </p>
        </div>
      </div>

      {/* ----Booking Slots ------ */}
      <div className='sm:ml-72 pl-4 mt-4 font-medium text-gray-700'>
        <p>Booking Slots</p>
        <div className='flex gap-3 items-center w-full overflow-x-scroll mt-4'>
          {
            docSlots.length > 0 && docSlots.map((item, index) => (
              <div 
                onClick={() => setSlotIndex(index)} 
                className={`text-center py-6 min-w-16 rounded-full cursor-pointer ${slotIndex === index ? 'bg-primary text-white' : 'border border-gray-200'}`} 
                key={index}
              >
                <p>{item[0] && daysOfWeek[item[0].datetime.getDay()]}</p>
                <p>{item[0] && item[0].datetime.getDate()}</p>
              </div>
            ))
          }
        </div>
        <div className='flex items-center gap-3 w-full overflow-x-scroll mt-4'>
          {docSlots.length > 0 && docSlots[slotIndex] && docSlots[slotIndex].map((item, index) => (
            <p 
              onClick={() => setSlotTime(item.time)} 
              className={`text-sm font-light flex-shrink-0 px-5 py-2 rounded-full cursor-pointer ${item.time === slotTime ? 'bg-primary text-white' : 'text-gray-400 border border-gray-300'}`} 
              key={index}
            >
              {item.time.toLowerCase()}
            </p>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Appointment;
