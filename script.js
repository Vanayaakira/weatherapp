const wrapper = document.querySelector(".wrapper"),
inputPart = document.querySelector(".input-part"),
infoTxt = inputPart.querySelector(".info-txt"),
inputField = inputPart.querySelector("input"),
locationBtn = inputPart.querySelector("button"),
weatherPart = wrapper.querySelector(".weather-part"),
wIcon = weatherPart.querySelector("img"),
arrowBack = wrapper.querySelector("header i");

let api;
let weatherData = {}; // Store weather data for additional features

// Add theme toggle functionality
const body = document.body;
const themeToggle = document.createElement("div");
themeToggle.className = "theme-toggle";
themeToggle.innerHTML = '<i class="bx bx-moon"></i>';
document.body.appendChild(themeToggle);

themeToggle.addEventListener("click", () => {
    body.classList.toggle("dark-theme");
    if (body.classList.contains("dark-theme")) {
        themeToggle.innerHTML = '<i class="bx bx-sun"></i>';
    } else {
        themeToggle.innerHTML = '<i class="bx bx-moon"></i>';
    }
    localStorage.setItem("weather-theme", body.classList.contains("dark-theme") ? "dark" : "light");
});

// Check if theme preference is stored
if(localStorage.getItem("weather-theme") === "dark") {
    body.classList.add("dark-theme");
    themeToggle.innerHTML = '<i class="bx bx-sun"></i>';
}

inputField.addEventListener("keyup", e =>{
    // if user pressed enter btn and input value is not empty
    if(e.key == "Enter" && inputField.value != ""){
        requestApi(inputField.value);
    }
});

locationBtn.addEventListener("click", () =>{
    if(navigator.geolocation){ // if browser support geolocation api
        navigator.geolocation.getCurrentPosition(onSuccess, onError);
    }else{
        alert("Your browser not support geolocation api");
    }
});

function requestApi(city){
    api = `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=c8b5a6bbb475bccfcd8d73c283fc6f13`;
    fetchData();
}

function onSuccess(position){
    const {latitude, longitude} = position.coords; // getting lat and lon of the user device from coords obj
    api = `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&units=metric&appid=c8b5a6bbb475bccfcd8d73c283fc6f13`;
    fetchData();
}

function onError(error){
    // if any error occur while getting user location then we'll show it in infoText
    infoTxt.innerText = error.message;
    infoTxt.classList.add("error");
}

function fetchData(){
    infoTxt.innerText = "Getting weather details...";
    infoTxt.classList.add("pending");
    // getting api response and returning it with parsing into js obj and in another 
    // then function calling weatherDetails function with passing api result as an argument
    fetch(api).then(res => res.json()).then(result => {
        weatherData = result; // Store data globally
        weatherDetails(result);
    }).catch(() =>{
        infoTxt.innerText = "Something went wrong";
        infoTxt.classList.replace("pending", "error");
    });
}

function weatherDetails(info){
    if(info.cod == "404"){ // if user entered city name isn't valid
        infoTxt.classList.replace("pending", "error");
        infoTxt.innerText = `${inputField.value} isn't a valid city name`;
    }else{
        //getting required properties value from the whole weather information
        const city = info.name;
        const country = info.sys.country;
        const {description, id} = info.weather[0];
        const {temp, feels_like, humidity, pressure} = info.main;
        const windSpeed = info.wind.speed;
        const sunrise = formatTime(info.sys.sunrise * 1000);
        const sunset = formatTime(info.sys.sunset * 1000);

        // using custom weather icon according to the id which api gives to us
        if(id == 800){
            wIcon.src = "icons/clear.svg";
        }else if(id >= 200 && id <= 232){
            wIcon.src = "icons/storm.svg";  
        }else if(id >= 600 && id <= 622){
            wIcon.src = "icons/snow.svg";
        }else if(id >= 701 && id <= 781){
            wIcon.src = "icons/haze.svg";
        }else if(id >= 801 && id <= 804){
            wIcon.src = "icons/cloud.svg";
        }else if((id >= 500 && id <= 531) || (id >= 300 && id <= 321)){
            wIcon.src = "icons/rain.svg";
        }
        
        //passing a particular weather info to a particular element
        weatherPart.querySelector(".temp .numb").innerText = Math.floor(temp);
        weatherPart.querySelector(".weather").innerText = description;
        weatherPart.querySelector(".location span").innerText = `${city}, ${country}`;
        weatherPart.querySelector(".temp .numb-2").innerText = Math.floor(feels_like);
        weatherPart.querySelector(".humidity span").innerText = `${humidity}%`;
        
        // Create weather metrics section if it doesn't exist
        if (!document.querySelector(".weather-metrics")) {
            // Create and add additional metrics
            const metricsSection = document.createElement("div");
            metricsSection.className = "weather-metrics";
            
            metricsSection.innerHTML = `
                <div class="metric-item">
                    <i class='bx bx-wind'></i>
                    <span>${(windSpeed * 3.6).toFixed(1)} km/h</span>
                    <p>Wind Speed</p>
                </div>
                <div class="metric-item">
                    <i class='bx bx-trending-up'></i>
                    <span>${pressure} hPa</span>
                    <p>Pressure</p>
                </div>
                <div class="metric-item">
                    <i class='bx bx-sun'></i>
                    <span>${sunrise}</span>
                    <p>Sunrise</p>
                </div>
                <div class="metric-item">
                    <i class='bx bx-moon'></i>
                    <span>${sunset}</span>
                    <p>Sunset</p>
                </div>
            `;
            
            // Insert before bottom-details
            const bottomDetails = weatherPart.querySelector(".bottom-details");
            weatherPart.insertBefore(metricsSection, bottomDetails);
        } else {
            // Update existing metrics
            const metricItems = document.querySelectorAll(".metric-item span");
            metricItems[0].innerText = `${(windSpeed * 3.6).toFixed(1)} km/h`;
            metricItems[1].innerText = `${pressure} hPa`;
            metricItems[2].innerText = sunrise;
            metricItems[3].innerText = sunset;
        }
        
        infoTxt.classList.remove("pending", "error");
        infoTxt.innerText = "";
        inputField.value = "";
        wrapper.classList.add("active");
        
        // Save last search to localStorage
        saveLastSearch(city);
    }
}

// Function to format time from timestamp
function formatTime(timestamp) {
    const date = new Date(timestamp);
    let hours = date.getHours();
    const minutes = date.getMinutes();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    
    hours = hours % 12;
    hours = hours ? hours : 12;
    
    return `${hours}:${minutes < 10 ? '0' + minutes : minutes} ${ampm}`;
}

// Save last search
function saveLastSearch(city) {
    localStorage.setItem("lastCity", city);
}

// Load last search on page load
window.addEventListener("DOMContentLoaded", () => {
    const lastCity = localStorage.getItem("lastCity");
    if (lastCity) {
        setTimeout(() => {
            requestApi(lastCity);
        }, 1000);
    }
});

arrowBack.addEventListener("click", ()=>{
    wrapper.classList.remove("active");
});

// Add responsive handling
function handleResize() {
    const width = window.innerWidth;
    if (width < 480) {
        // Mobile view adjustments
        document.querySelectorAll(".metric-item").forEach(item => {
            item.style.width = "90%";
        });
    } else {
        // Reset for larger screens
        document.querySelectorAll(".metric-item").forEach(item => {
            item.style.width = "auto";
        });
    }
}

// Listen for window resize
window.addEventListener("resize", handleResize);
// Call once on load
handleResize();
