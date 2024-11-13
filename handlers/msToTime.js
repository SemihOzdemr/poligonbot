import config from '../config.json' assert { type: "json" };

export default function msToTime(duration) {
    try {
        var milliseconds = Math.floor((duration % 1000) / 100),
        seconds = Math.floor((duration / 1000) % 60),
        minutes = Math.floor((duration / (1000 * 60)) % 60),
        hours = Math.floor((duration / (1000 * 60 * 60)) % 24);
    
      let string = "";
    
      string += hours>0 ? `${hours} saat `: "";
      string += minutes>0 ? `${minutes} dakika `: "";
      string += seconds>0 ? `${seconds} saniye `: "";
    
      return string;
    } catch (error) {
       console.log(error);
        return false;

    }

}