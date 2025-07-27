# Restaurant POS

A desktop Point‑of‑Sale application built with Electron.js, React, and lowdb, optimized for both takeaway and table service workflows. Lightning‑fast order entry, customizable printing, and built‑in accounting make managing sales, tickets, and receipts seamless.

## Table of Contents

* [Features](#features)
* [Demo Screenshots](#demo-screenshots)
* [Technologies](#technologies)
* [Installation](#installation)
* [Usage](#usage)
* [Configuration](#configuration)
* [Contributing](#contributing)

## Features

* **Order Modes**: Switch between Takeaway and Table Service with a single click.
* **Printing**: Instantly print customer receipts, kitchen tickets, and custom slips (e.g., “Pizzario” ticket).
* **Sales Logging**: Automatic recording of every sale, with searchable history.
* **Printer Configuration**: Set up one or two printers for front‑ and back‑of‑house workflows.
* **Clean UI**: Modern, intuitive interface for rapid order entry.

## Demo Screenshots

---

![Point of Sale Home](https://tntaizamsozuvsaecpsl.supabase.co/storage/v1/object/public/portfolio/images/posHome.png)
*Home screen: overview of sales and quick access to modes.*

---

![Point of Sale Takeaway](https://tntaizamsozuvsaecpsl.supabase.co/storage/v1/object/public/portfolio/images/posTakeaway.png)
*Takeaway mode: fast item selection and receipt printing.*

---

![Point of Sale Table Service](https://tntaizamsozuvsaecpsl.supabase.co/storage/v1/object/public/portfolio/images/posTable.png)
*Table Service: manage active tables and orders.*

---

![Point of Sale Accountant](https://tntaizamsozuvsaecpsl.supabase.co/storage/v1/object/public/portfolio/images/posAccountant.png)
*Accounting module: revenue, cost tracking, and exports.*

---

## Technologies

* **Electron.js**: Desktop application framework.
* **React**: UI library for building responsive components.
* **lowdb**: Lightweight local JSON database for persistence.

## Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/solxire88/restaurant-pos.git
   cd restaurant-pos
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Run the app**

   ```bash
   npm start
   ```

## Usage

* Select **Takeaway** or **Table Service** mode from the home screen.
* Add items to the order and click **Print** to generate receipts or tickets.
* Open **Accounting** to view revenue, costs, and export data.

## Configuration

1. Go to **Settings**.
2. Under **Printers**, configure one or two printers for:

   * Front‑of‑house (customer receipts)
   * Back‑of‑house (kitchen tickets)
3. Save settings and restart the application if needed.


## Contributing

Contributions are welcome! Please open an issue or submit a pull request for bug fixes, enhancements, or new features.

