# README

This pulsar map application has been made to generate updated 
Pulsar Maps based on latest data fetched from ATNF pulsar database.

As well as generating pulsar maps with estimated periods at a specific date.

The application has two main components. A backend server written in python.
And a frontend React application that is used to generate the map.

## Running the application (development)
To start the backend server, start by installing the python dependencies in a virtual environment.
```bash
cd server/
python -m venv venv
venv/bin/activate

pip install -r requirements.txt
```

Then run the server by running:
```bash
flask run
```

After the backend server is started, you are ready to run the React application.
First, install the npm dependencies:
```bash
npm install
```
In a separate terminal, run the following command:
```bash
npm run dev
```

In a browser, go to the following address `http://localhost:5173/` and start adding pulsars by inserting the name.
To generate the original pulsar map, but with updated data, add the following pulsars.
`J1731-4744, J1456-6843, J1243-6423, J0835-4510, J0953+0755, J0826+2637,
J0534+2200, J0528+2200, J0332+5434, J2219+4754, J2018+2839, J1935+1616,
J1932+1059, J1645-0317`

