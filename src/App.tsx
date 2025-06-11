import { useState } from 'react'
import './App.css'

// function App() {
//     const [count, setCount] = useState(0)

//     return (
//         <>
//         <div>
//             <a href="https://vite.dev" target="_blank">
//             <img src={viteLogo} className="logo" alt="Vite logo" />
//             </a>
//             <a href="https://react.dev" target="_blank">
//             <img src={reactLogo} className="logo react" alt="React logo" />
//             </a>
//         </div>
//         <h1>Vite + React</h1>
//         <div className="card">
//             <button onClick={() => setCount((count) => count + 1)}>
//             count is {count}
//             </button>
//             <p>
//             Edit <code>src/App.tsx</code> and save to test HMR
//             </p>
//         </div>
//         <p className="read-the-docs">
//             Click on the Vite and React logos to learn more
//         </p>
//         </>
//     )
// }

const Sidebar = ({pulsars, addPulsar, removePulsar}) => {

    const [input, setInput] = useState("");

    const handleAdd = (name) => {
        addPulsar(name)
        setInput("")
    };

    return (
        <>
        
        <div>

            <input 
                id="pulsar-search-bar" 
                placeholder="Enter pulsar name" 
                value={input}
                onChange={(val) => setInput(val.target.value)}>
            </input>
        </div>

        <br></br> {/* patapim */}

        <div>
            <button onClick={()=> handleAdd(input)}>
                Add Pulsar
            </button>

        </div>
        <hr></hr>
        <div>
            Active pulsar(s):
            <ul>
                {pulsars.map((p, index) => (
                    <li key={index}>
                        <span>{p}</span>
                        <button onClick={() => removePulsar(p)}>x</button>
                    </li>
                ))}
            </ul>
        </div>
        </>
    )
};

const PulsarMap = ({pulsars}) => {
    return (
        <>
        </>
    )
}

function App() {

    const [pulsars, setPulsars] = useState([])

    const addPulsar = (name) => {
        if (!pulsars.includes(name)) {
            setPulsars([...pulsars, name]);
        }
    };

    const removePulsar = (name) => {
        setPulsars(pulsars.filter(p => p !== name));
    };

    return (
        <div>
            <Sidebar pulsars={pulsars} addPulsar={addPulsar} removePulsar={removePulsar}/>
            <PulsarMap pulsars={pulsars}/>
        </div>
    )
}


const fetchPulsarData = async (name) => {
  const response = await fetch(`https://example.com/api/pulsars/${name}`);
  const data = await response.json();
  return data;
};


export default App
