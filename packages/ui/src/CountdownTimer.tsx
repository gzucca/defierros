import React, { useEffect, useState } from "react";

interface TimeState {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

interface CountdownTimerProps {
  endDate: Date;
}

const getLength = (number: number): number => {
  return number.toString().length;
};

const MILLISECONDS_PER_DAY = 1000 * 60 * 60 * 24;
const MILLISECONDS_PER_HOUR = 1000 * 60 * 60;
const MILLISECONDS_PER_MINUTE = 1000 * 60;
const MILLISECONDS_PER_SECOND = 1000;

// Update the count down every 1 second
export default function CountdownTimer({ endDate }: CountdownTimerProps) {
  const countDownDate = new Date(endDate).getTime();
  const [time, setTime] = useState<TimeState>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });
  const [finish, setFinish] = useState<number>(0);

  useEffect(() => {
    const timer = setInterval(() => {
      const today = new Date().getTime();
      const distance = countDownDate - today;

      if (distance < 0 || distance > MILLISECONDS_PER_DAY) {
        clearInterval(timer);
      }

      setFinish(distance);

      // Time calculations for days, hours, minutes and seconds
      setTime({
        days: Math.floor(distance / MILLISECONDS_PER_DAY),
        hours: Math.floor(
          (distance % MILLISECONDS_PER_DAY) / MILLISECONDS_PER_HOUR,
        ),
        minutes: Math.floor(
          (distance % MILLISECONDS_PER_HOUR) / MILLISECONDS_PER_MINUTE,
        ),
        seconds: Math.floor(
          (distance % MILLISECONDS_PER_MINUTE) / MILLISECONDS_PER_SECOND,
        ),
      });
    }, 1000);

    return () => {
      clearInterval(timer);
    };
  }, [endDate, countDownDate]);

  // If the count down is finished, write some text
  if (finish < 0) {
    return <p className="text-gray-400">Subasta Finalizada</p>;
  }

  if (time.days > 0) {
    return (
      <p className="text-white">
        {time.days} {time.days === 1 ? "día" : "días"}
      </p>
    );
  }

  if (
    time.days === 0 &&
    time.hours === 0 &&
    time.minutes === 0 &&
    time.seconds === 0
  ) {
    return <p className="text-gray-400"> --:--:-- </p>;
  }

  return (
    <p className="text-white">
      {getLength(time.hours) === 1 ? `0${time.hours}` : `${time.hours}`}:
      {getLength(time.minutes) === 1 ? `0${time.minutes}` : `${time.minutes}`}:
      {getLength(time.seconds) === 1 ? `0${time.seconds}` : `${time.seconds}`}
    </p>
  );
}
