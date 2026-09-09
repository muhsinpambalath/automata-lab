import './Hero.css'
import InteractivePreview from './InteractivePreview'

function Hero() {
    return (
        <section className='hero'>
            <p className='hero-kicker'>INTERACTIVE COMPUTING LAB</p>

            <h1>Build it. Run it. Understand it.</h1>

            <p className='hero-description'>
                Explore core computer science through interactive models.
                Build, simulate, and visualize algorithms, data structures, and systems.
            </p>

            <button className='hero-button'>Enter the Lab</button>

            <InteractivePreview />

        </section>
    )
}

export default Hero