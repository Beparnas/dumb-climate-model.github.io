import matplotlib.pyplot as plt

# --- constants ---
K = 0.0097
J=50
A = 0.1
B = 2
sunlight = 1
stopEmittingCarbon=False
sequestration = False
climateAgreement = False

# --- initial conditions ---
wv_pct = 0.0097
ghg_pct = 0.0003
temperature = 20 #deg C
abs_coeff = 0.5
rad_coeff = 0.025

# --- time settings ---
steps = 200
dt = 1  # time step size

# --- storage for plotting ---
time_vals = []
wv_vals = []
temp_vals = []
ghg_vals = []
abs_vals = []
wp_health_vals = []

# --- simulation loop ---
for t in range(steps):
    time_vals.append(t * dt)
    wv_vals.append(wv_pct)
    temp_vals.append(temperature)
    ghg_vals.append(ghg_pct*100)
    abs_vals.append(abs_coeff)
    

    wp_health = 0.5 if temperature < 21 else 0.45
    wp_health_vals.append(wp_health)
    # update variables
    abs_coeff = J * (wv_pct + ghg_pct)
    temperature = temperature + sunlight * abs_coeff - temperature*rad_coeff
    wv_pct = K * (temperature * A - wp_health * B)
    
    if stopEmittingCarbon and not sequestration:
        if ghg_pct>0.00032:
            pass    
        else:
            ghg_pct= ghg_pct+2.4E-7
    elif stopEmittingCarbon and sequestration:
        if climateAgreement == False and ghg_pct>=0.00032:
            climateAgreement = True
        if climateAgreement:
            ghg_pct= ghg_pct-2.4E-7
        else:
            ghg_pct= ghg_pct+2.4E-7
    else:
        ghg_pct= ghg_pct+2.4E-7

# --- plotting ---
fig,(ax1,ax2,ax3) = plt.subplots(3,1)
fig.suptitle('Simulation of Climate Variables Over Time')

ax1.plot(time_vals, temp_vals, label='temperature')
ax1.set_xlabel('Time')
ax1.set_ylabel('temperature (C)')


ax2.plot(time_vals, wv_vals, label='wv_pct')
ax2.plot(time_vals, abs_vals, label='abs_coeff')
ax2.plot(time_vals, wp_health_vals, label='wp_health')

ax2.set_xlabel('Time')
ax2.set_ylabel('Value')
ax2.legend(loc="lower right")

ax3.plot(time_vals, ghg_vals, label='ghg_pct')
ax3.set_xlabel('Time')
ax3.set_ylabel('GHG pct.')

plt.grid(True)
plt.show()