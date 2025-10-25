// Constants
//arbitrary coefficient for relating the heat absorbtion coefficient 
// to ghg and water vapor percentages
const J = 50;
//arbitrary constants for relating the water vapor to temperature and weather patterns
//total coefficient
const K = 0.0097;
//temperature coefficient
const A = 0.1;
//weather pattern health coefficient
const B = 2;
const sunlight = 1;
//timing
let sequestration = false;
let sequestrationYear = 200;
let stopEmitting = false;
let stopEmittingYear = 200;

// Initial conditions
let wv_pct = 0.0097;
let ghg_pct = 0.0003;
let starting_temperature = 20;
let temperature = starting_temperature; // deg C
let abs_coeff = 0.5;
let rad_coeff = 0.025;
//weather pattern shift parameters
let wp_health = 0.5;
let wp_degradation_pct = 10; //pct
let wp_shift_thresh = 21;

//ghg parameters
let ghgppm = 2.4E-7;

// Time settings
const steps = 225;
const dt = 1; // time step size

// Storage for plotting
let time_vals = new Array(steps);
let wv_vals = new Array(steps);
let temp_vals = new Array(steps);
let ghg_vals = new Array(steps);
let abs_vals = new Array(steps);
let wp_health_vals = new Array(steps);

//charts
let temperatureChart;
let variablesChart;
let ghgChart;


function getValue(id){
    let elm = document.getElementById(id);
    let inp = elm.getElementsByTagName("input")[0];
    if( inp.type === "checkbox"){
        return inp.checked;
    }
    else{
        return inp.value;
    }
    
}
function updateValue(element){
    const value = element.getElementsByTagName("input")[0].value;
    try {
        element.getElementsByClassName("val")[0].innerText = value;
    } catch (e) {
        return;
    }
    
}
function setValue(element,value){
    const inp = element.getElementsByTagName("input")[0];
    inp.value = value;
    updateValue(element);
}

function getInputs(){
    ghgppm = parseFloat(getValue("ghgrate"))/1E6;
    wp_shift_thresh = parseFloat(getValue("shiftthresh"));
    wp_degradation_pct = parseInt(getValue("cloudpct"));
    stopEmitting = getValue("stopEmitting");
    stopEmittingYear = parseInt(getValue("stopEmittingYear"));
    sequestration = getValue("sequestration");
    sequestrationYear = parseInt(getValue("sequestrationYear"));
    
}
function setInputs(){
    setValue(document.getElementById("ghgrate"),String(ghgppm*1E6));
    setValue(document.getElementById("shiftthresh"),String(wp_shift_thresh));
    setValue(document.getElementById("cloudpct"),String(wp_degradation_pct));
    setValue(document.getElementById("stopEmitting"),String(stopEmitting));
    setValue(document.getElementById("stopEmittingYear"),String(stopEmittingYear));
    setValue(document.getElementById("sequestration"),String(sequestration));
    setValue(document.getElementById("sequestrationYear"),String(sequestrationYear));

}
function reset(){
    ghgppm = 2.4E-7;
    wp_shift_thresh = 21;//deg C
    wp_degradation_pct = 10;
    stopEmitting = false;
    stopEmittingYear = 225;
    sequestration = false;
    sequestrationYear = 225;
    
    setInputs();
    updateSimulation();
}

function updateSimulation(){
    getInputs();
    runsimulation();
    temperatureChart.update();
    variablesChart.update();
    ghgChart.update();
}
// Simulation loop
function runsimulation(){
    //reset storage arrays and initial conditions
    // Initial conditions
    wv_pct = 0.0097;
    ghg_pct = 0.0003;
    temperature = starting_temperature; // deg C
    abs_coeff = 0.5;
    rad_coeff = 0.025;
    //reset values
    temperature = starting_temperature;
    for (let t = 0; t < steps; t++) {
        time_vals[t] = t * dt;
        wv_vals[t] = wv_pct;
        temp_vals[t] = temperature;
        ghg_vals[t] = (ghg_pct * 100);
        abs_vals[t] = (abs_coeff);

        wp_health = temperature < wp_shift_thresh ? 0.5 : 0.5*(1-(wp_degradation_pct/100));
        wp_health_vals[t] = (wp_health);
        
        // Update variables
        abs_coeff = J * (wv_pct + ghg_pct);
        temperature = temperature + sunlight * abs_coeff - temperature * rad_coeff;
        wv_pct = K * (temperature * A - wp_health * B);
        
        //update GHG percentage
        //default
        let ghg_net = ghgppm;
        //reduce if we stop emitting
        if (stopEmitting && stopEmittingYear<= t){
            ghg_net = ghg_net-ghgppm;
        }
        //reduce further if we're sequestering
        if (sequestration && sequestrationYear<=t){
            ghg_net = ghg_net - ghgppm;
        }
        ghg_pct = ghg_pct + ghg_net;
        
    }
}

// Create the plots using Chart.js
function createCharts() {
    //generate initial data
    runsimulation();
    // Temperature Chart
    const tempCtx = document.getElementById('tempChart').getContext('2d');
    temperatureChart = new Chart(tempCtx, {
        type: 'line',
        data: {
            labels: time_vals,
            datasets: [{
                label: 'Temperature',
                data: temp_vals,
                borderColor: 'rgb(255, 99, 132)',
                tension: 0.1
            }]
        },
        options: {
            responsive: true,
            plugins: {
                title: {
                    display: true,
                    text: 'Temperature Over Time'
                }
            },
            scales: {
                x: {
                    title: {
                        display: true,
                        text: 'Time'
                    }
                },
                y: {
                    title: {
                        display: true,
                        text: 'Temperature (C)'
                    }
                }
            }
        }
    });

    // Variables Chart
    const varsCtx = document.getElementById('varsChart').getContext('2d');
    variablesChart = new Chart(varsCtx, {
        type: 'line',
        data: {
            labels: time_vals,
            datasets: [{
                label: 'Water Vapor %',
                data: wv_vals,
                borderColor: 'rgb(54, 162, 235)',
                tension: 0.1
            }, {
                label: 'Absorption Coefficient',
                data: abs_vals,
                borderColor: 'rgb(75, 192, 192)',
                tension: 0.1
            }, {
                label: 'WP Health',
                data: wp_health_vals,
                borderColor: 'rgb(153, 102, 255)',
                tension: 0.1
            }]
        },
        options: {
            responsive: true,
            plugins: {
                title: {
                    display: true,
                    text: 'Climate Variables Over Time'
                }
            },
            scales: {
                x: {
                    title: {
                        display: true,
                        text: 'Time'
                    }
                },
                y: {
                    title: {
                        display: true,
                        text: 'Value'
                    }
                }
            }
        }
    });

    // GHG Chart
    const ghgCtx = document.getElementById('ghgChart').getContext('2d');
    ghgChart = new Chart(ghgCtx, {
        type: 'line',
        data: {
            labels: time_vals,
            datasets: [{
                label: 'GHG %',
                data: ghg_vals,
                borderColor: 'rgb(255, 159, 64)',
                tension: 0.1
            }]
        },
        options: {
            responsive: true,
            plugins: {
                title: {
                    display: true,
                    text: 'Greenhouse Gas % Over Time'
                }
            },
            scales: {
                x: {
                    title: {
                        display: true,
                        text: 'Time'
                    }
                },
                y: {
                    title: {
                        display: true,
                        text: 'GHG %'
                    }
                }
            }
        }
    });
}
