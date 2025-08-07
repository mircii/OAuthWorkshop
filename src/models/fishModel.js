class Fish {
  constructor(id, name, species, habitat, sizeCm, endangered) {
    this.id = id;                   // Unique identifier
    this.name = name;               // Common name
    this.species = species;         // Scientific name
    this.habitat = habitat;         // Ocean, river, freshwater, etc.
    this.sizeCm = sizeCm;           // Average size in cm
    this.endangered = endangered;   // Boolean flag
  }
}

module.exports = Fish;