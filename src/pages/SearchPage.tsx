"use client";

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";
import SearchInput from "../components/SearchInput";
import ActionButton from "../components/ActionButton";
import TransportItem from "../components/TransportItem";

const SearchPage = () => {
    const [searchTerm, setSearchTerm] = useState("");
    const navigate = useNavigate();

    const handleSearch = () => {
        navigate("/lines");
    };

    return (
        <div className="space-y-6 pb-16">
            <Header title="Ciencia Link" />

            <div className="space-y-4">
                <p className="text-sm font-medium">
                    Ingresa la zona donde quieres ir
                </p>

                <SearchInput
                    placeholder="Zona sur"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />

                <ActionButton label="Buscar" onClick={handleSearch} />
            </div>

            <div className="rounded-2xl border shadow p-4 bg-background/95 backdrop-blur-lg">
                <h2 className="text-lg font-medium">Líneas</h2>

                <div className="space-y-2">
                    <TransportItem
                        type="bus"
                        label="Sindicato Litoral"
                        onClick={() => navigate("/lines")}
                    />
                    <TransportItem
                        type="bus"
                        label="Sindicato Mayo"
                        onClick={() => navigate("/lines")}
                    />
                    <TransportItem
                        type="trufi"
                        label="Trufi 234"
                        onClick={() => navigate("/lines")}
                    />
                </div>
            </div>
        </div>
    );
};

export default SearchPage;
