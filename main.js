
const API_KEY= "f730dd16700703fa6944e682ef116b0f";
const DAYS_OF_THE_WEEK = ["sun","mon","tue","wed","thu","fri","sat"];

const getCitiesUsingGeolocation =async(searchText)=> {
    const response=await fetch(`http://api.openweathermap.org/geo/1.0/direct?q=${searchText}&limit=5&appid=${API_KEY}`) ;
    return response.json();
}



const getCurrentWeatherData = async()=>{
    const city = "pune";
    const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=metric`);
    return response.json();

}
const gethourlyForecast = async ({ name: city }) => {
    const response = await fetch(`https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${API_KEY}&units=metric`);
    const data = await response.json();
    return data.list.map(forecast => {
        const { main: { temp, temp_max, temp_min }, dt, dt_txt, weather: [{ description, icon }] } = forecast;
        return { temp, temp_max, temp_min, dt, dt_txt, description, icon }
    })
}
const formatTemperature = (temp)=>`${temp?.toFixed(1)}°`

const createIconUrl = (icon) => `http://openweathermap.org/img/wn/${icon}@2x.png`


const loadCurrentForecast = ({ name, main: { temp, temp_max, temp_min }, weather: [{ description }] }) => {
    const currentForecastElement = document.querySelector("#current-forecast");
    currentForecastElement.querySelector(".city").textContent = name;
    currentForecastElement.querySelector(".temp").textContent = formatTemperature(temp);
    currentForecastElement.querySelector(".description").textContent = description;
    currentForecastElement.querySelector(".min-max-temp").textContent = `H: ${formatTemperature(temp_max)} L:${formatTemperature(temp_min)}`;
}

const loadhourlyForecast = ({main:{temp:tempNow},weather:[{icon:iconNow}]},hourlyForecast)=>{
    console.log(hourlyForecast);
    const timeFormatter=Intl.DateTimeFormat("en",{
        hour12:true,hour:"numeric"
    })
    let dataFor12Hours = hourlyForecast.slice(2,14);
    const hourlyContainer = document.querySelector(".hourly-container");
    let innerHTMLString = `<article>
    <h3 class="time">Now</h3>
    <img class="icon" src="${createIconUrl(iconNow)}" />
    <p class="hourly-temp">${formatTemperature(tempNow)}</p>
  </article>`;

    for (let { temp, icon, dt_txt } of dataFor12Hours) {

        innerHTMLString += `<article>
            <h3 class="time">${timeFormatter.format(new Date(dt_txt))}</h3>
            <img class="icon" src="${createIconUrl(icon)}" />
            <p class="hourly-temp">${formatTemperature(temp)}</p>
          </article>`
    }
    hourlyContainer.innerHTML = innerHTMLString;
}
const calculateDayWiseForecast = (hourlyForecast)=>{
    let dayWiseForecast = new Map();
    for(let forecast of hourlyForecast){
        const [date] = forecast.dt_txt.split(" ");
        const dayoftheWeek = DAYS_OF_THE_WEEK[new Date(date).getDay()];
        if (dayWiseForecast.has(dayoftheWeek)){
            let forecastForTheDay = dayWiseForecast.get(dayoftheWeek);
            forecastForTheDay.push(forecast);
            dayWiseForecast.set(dayoftheWeek,forecastForTheDay)
        }else{
            dayWiseForecast.set(dayoftheWeek,[forecast]);
        }
    }
        for(let [key,value] of dayWiseForecast ){
            let temp_min = Math.min(...Array.from(value,val=>val.temp_min));
            let temp_max = Math.min(...Array.from(value,val=>val.temp_max));
            dayWiseForecast.set(key,{temp_min,temp_max,icon :value.find(v=>v.icon).icon})    
        }
        return dayWiseForecast;

    
    
}


const loadFiveDayForecast = (hourlyForecast)=>{
    const dayWiseForecast = calculateDayWiseForecast(hourlyForecast);
    const container = document.querySelector(".five-day-forecast-container");
    let dayWiseInfo = "";
    Array.from(dayWiseForecast).map(([day,{temp_max,temp_min,icon}],index)=>{
        dayWiseInfo += `<article class="day-wise-forecast">
        <h3 class="day">${index ===0? "today": day}</h3>
        <img src="${createIconUrl(icon)}" alt="icon for the forecast" class="icon">
        <p class="min-temp">${formatTemperature(temp_min)}</p>
        <p class="max-temp">${formatTemperature(temp_max)}</p>
      </article>`;

    });
    container.innerHTML = dayWiseInfo;
}

const loadFeelsLike = ({main:{feels_like}})=>{
    let container = document.querySelector("#feels-like");
    container.querySelector(".feels-like-temp").textContent = formatTemperature(feels_like);
}
const loadHumidity = ({main:{humidity}})=>{
    let container = document.querySelector("#humidity");
    container.querySelector(".humidity-value").textContent = `${humidity} %`;
}
const onSearchChange = (event)=>{
    let {value}=event.target;
    getCitiesUsingGeolocation(value);
}
document.addEventListener("DOMContentLoaded",async ()=>{

    const searchInput=document.querySelector("#search");
    searchInput.addEventListener("input",)
    const currentWeather= await getCurrentWeatherData();
    loadCurrentForecast(currentWeather)
    const hourlyForecast = await gethourlyForecast(currentWeather);
    loadhourlyForecast(currentWeather, hourlyForecast);
    loadFiveDayForecast(hourlyForecast);
    loadFeelsLike(currentWeather);
    loadHumidity(currentWeather);

})