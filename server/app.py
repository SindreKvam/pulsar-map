"""Flask backend to fetch data from the ATNF database"""

import numpy as np
from flask import Flask, request, jsonify
from flask_cors import CORS
import psrqpy

PARAMETERS = [
    "PSRJ",
    "RAJ",  # Position
    "DECJ",
    "GL",  # Galactic position
    "GB",
    "P0",  # Period
    "P1",  # Period derivative
    "PEPOCH",  # Epoch of period
    "DM",  # Dispersion Measure
    "DIST",  # Distance proxies
    "PX",
    "S1400",  # Brightness at 1400 MHz
    "AGE",  # Derived characteristics
    "BSURF",
]

app = Flask(__name__)
CORS(app, origins="*")


def pulsar_data_to_dict(data) -> dict:
    """Parse data into a clean dictionary"""
    return {
        "name": data["PSRJ"][0],
        "position": {"ra": data["RAJ"][0], "dec": data["DECJ"][0]},
        "galactic_position": {"gl": data["GL"][0], "gb": data["GB"][0]},
        "period_s": data["P0"][0],
        "period_derivative": data["P1"][0],
        "period_epoch": data["PEPOCH"][0],
        "dispersion_measure": data["DM"][0],
        "distance_kpc": data["DIST"][0] or data["PX"][0],
        "flux_density_1400": data["S1400"][0],
        "characteristics": {"age": data["AGE"][0], "surface_mag_field": data["BSURF"][0]},
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
