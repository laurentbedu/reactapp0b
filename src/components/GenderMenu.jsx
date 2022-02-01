import { useEffect, useState } from "react";
import { GenderService } from "../services/gender.service";

export function GenderMenu(props) {

    const [genders, setGenders] = useState([]);

    useEffect(() => {
        const fetchData = async () => {
            let service = new GenderService();
            let data = await service.with("Product").getAll();
            setGenders(data);
        }
        fetchData().catch(console.error);;
    }, [])

    return (
        <ul className="nav bg-dark ">
            {genders.map(gender => {
                return <li className="nav-item">
                            <a className="nav-link link-light" href="#">{gender.title}</a>
                        </li>
            })}
            {/* <li className="nav-item">
                <a className="nav-link link-light" href="#">Femmes</a>
            </li>
            <li className="nav-item">
                <a className="nav-link link-light" href="#">Homme</a>
            </li>
            <li className="nav-item">
                <a className="nav-link link-light" href="#">Enfants</a>
            </li>
            <li className="nav-item">
                <a className="nav-link link-light" href="#">Bébés</a>
            </li> */}
        </ul>
    );
}