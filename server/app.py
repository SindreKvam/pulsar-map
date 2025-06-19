"""Flask backend to fetch data from the ATNF database"""

import numpy as np
from flask import Flask, request, jsonify
from flask_cors import CORS
import psrqpy

PARAMETERS = [
    "PSRJ",  # Pulsar name
    "GL",  # Galactic position
    "GB",
    "P0",  # Period
    "P1",  # Period derivative
    "PEPOCH",  # Epoch of period
    "DIST",  # Distance proxies
    "AGE",  # Derived characteristics
]

app = Flask(__name__)
CORS(app, origins="*")


def pulsar_data_to_dict(data) -> dict:
    """Parse data and calculate relevant quantities into a clean dictionary.
    This function assumes that the first result is the desired pulsar."""
    print(data["GL"][0])
    print(data["GB"][0])
    # Galactic position (galactic longitude and latitude)
    galactic_longitude_rad = np.deg2rad(data["GL"][0])
    galactic_latitude_rad = np.deg2rad(data["GB"][0])

    # Period in seconds and turn it into period in amount of h transitions,
    # as used in the voyager plaque.
    # The period of hydrogen transition is approximately 7.040241838e-10 seconds. (1/1420.4057MHz)
    period_s = data["P0"][0]  # Period in seconds
    period_h_transition = period_s / 7.040241838e-10  # Convert to hydrogen transitions

    # Distance in kpc, using the distance proxy or parallax
    distance_kpc = data["DIST"][0]
    # Relative to the Sun's distance from the Galactic Center (8 kpc)
    relative_distance = distance_kpc / 8

    # Calculate the distance along the galactic plane
    relative_xy_distance = relative_distance * np.cos(galactic_latitude_rad)
    # Calculate the distance to the galactic plane
    relative_z_distance = relative_distance * np.sin(galactic_latitude_rad)

    return {
        "name": data["PSRJ"][0],
        "galactic_longitude_rad": galactic_longitude_rad,
        "galactic_latitude_rad": galactic_latitude_rad,
        "period_s": data["P0"][0],
        "period_derivative": data["P1"][0],
        "period_epoch": data["PEPOCH"][0],
        "period_h_transition": int(period_h_transition),
        "distance_kpc": distance_kpc,
        "relative_distance": relative_distance,
        "relative_xy_distance": relative_xy_distance,
        "relative_z_distance": relative_z_distance,
        "age": data["AGE"][0],
    }


@app.route("/pulsar")
def get_pulsar():
    """Get pulsar from the ATNF library"""
    name = request.args.get("name")

    try:
        query = psrqpy.QueryATNF(params=PARAMETERS, psrs=[name])
        dataframe = query.pandas
        data = dataframe.replace({np.nan: None})

        return jsonify(pulsar_data_to_dict(data))
    except Exception as e:
        return jsonify({"error": str(e)}), 400


if __name__ == "__main__":
    # Run the Flask app

    app.run(port=5000)
