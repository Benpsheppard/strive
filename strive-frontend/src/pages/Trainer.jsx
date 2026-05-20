// Trainer.jsx

// Component Imports
import Header from '../components/headers/Header'

const Trainer = () => {
    const [suggestions, setSuggestions] = useState([])

    useEffect(() => {
        dispatchEvent(getSuggestions())
    })

    return (
        <section className="min-h-screen mt-0 md:mt-20 flex flex-col items-center px-4 pb-32">
            <Header />

            <div className="text-4xl md:text-6xl font-semibold text-[#EDF2F4] text-center p-4">
                <h1>Strive <span className="text-[#EF233C]">Trainer</span></h1>
            </div>




        </section>
    )
}

export default Trainer