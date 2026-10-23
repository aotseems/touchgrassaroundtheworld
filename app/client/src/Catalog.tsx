import { useState } from 'react'
import tempgrassimg from './assets/react.svg'
import './Catalog.css'

const grassList = [
    { id: 1, name: 'Grass A', img:tempgrassimg , info: 'Green grass' },
    { id: 2, name: 'Grass B', img:tempgrassimg, info: 'Tall grass' },
    { id: 3, name: 'Grass C', img:tempgrassimg, info: 'Short grass' },
    { id: 4, name: 'Blue Grass', img:tempgrassimg, info: 'Blue-colored grass' },
    { id: 5, name: 'Red Grass', img:tempgrassimg, info: 'Red-colored grass' },
]

function Catalog() {

    const [search, setSearch] = useState('')

    const filteredGrass = grassList.filter((grass) =>
        grass.name.toLowerCase().includes(search.toLowerCase())
    )

    return (
        
        <section id="catalog">

            <input
                type="search"
                placeholder="Search grass by name..."
                value={search}
                onChange={(event) => setSearch(event.target.value)}
            />

            <section id="all-grass">
                {filteredGrass.map((grass) => (
                    <div className="catalog-card" key={grass.id}>
                        <div className="grass-name">{grass.name}</div>

                        <img src={grass.img} alt={grass.name} />

                        <div className="grass-info">
                            {grass.info}
                        </div>

                    </div>
                ))}
            </section>
        </section>
    )
}

export default Catalog