"use client"

import { useState } from "react"
import React from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card"
import { Input } from "./ui/input"
import { Button } from "./ui/button"
import { Search } from "lucide-react"

const QuickSearch = () => {
  const [searchTerm, setSearchTerm] = useState("")

  const handleSearch = (e) => {
    e.preventDefault()
    // Implement search functionality here
    console.log("Searching for:", searchTerm)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-2xl font-medium">Pencarian Cepat</CardTitle>
        <CardDescription>Cari pasien berdasarkan nama atau ID</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSearch} className="flex space-x-2">
          <Input placeholder="Nama atau ID Pasien" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
          <Button type="submit">
            <Search />
            Cari
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}

export default QuickSearch