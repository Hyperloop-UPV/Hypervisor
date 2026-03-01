
<a id="readme-top"></a>

<!-- PROJECT LOGO -->
<br />
<div align="center">


  <h3 align="center">Hypervisor</h3>

  <p align="center">
Full-stack real-time telemetry platform for public Hyperloop demos. Captures live packet data and visualizes system state via SSE streaming.    <br />
   
  </p>
</div>



<!-- TABLE OF CONTENTS -->
<details>
  <summary>Table of Contents</summary>
  <ol>
    <li>
      <a href="#about-the-project">About The Project</a>
      <ul>
        <li><a href="#built-with">Built With</a></li>
      </ul>
    </li>
    <li>
      <a href="#getting-started">Getting Started</a>
      <ul>
        <li><a href="#prerequisites">Prerequisites</a></li>
        <li><a href="#installation">Installation</a></li>
      </ul>
    </li>
    <li><a href="#usage">Usage</a></li>
    <li><a href="#contributors">Contributors</a></li>
    <li><a href="#license">License</a></li>

  </ol>
</details>



## About The Project

[![Product Name Screen Shot][product-screenshot]](https://example.com)

Hypervisor is a full-stack real-time telemetry and visualization platform developed at Hyperloop UPV for public demonstrations.

The backend, written in Go, captures live network packets from the vehicle infrastructure, processes them into structured domain state, and streams real-time updates via Server-Sent Events (SSE).

The frontend, built with React, consumes these event streams and renders a responsive, read-only visualization of the system during live demos. This allows audiences to observe real-time system behaviour without interfering with operational control.

The architecture emphasizes determinism, reliability, and a strict separation between control and observation to ensure stable performance under live event conditions.

<p align="right">(<a href="#readme-top">back to top</a>)</p>



### Built With

This section should list any major frameworks/libraries used to bootstrap your project. Leave any add-ons/plugins for the acknowledgements section. Here are a few examples.

* [![Go][Go-badge]][Go-url]
* [![React][React-badge]][React-url]
* [![TypeScript][TS-badge]][TS-url]

<p align="right">(<a href="#readme-top">back to top</a>)</p>



<!-- GETTING STARTED -->
## Getting Started

To get a local copy up and running follow these simple example steps.

### Prerequisites

- Node.js >= v25.6.1
- npm  >= 11.10.1
- libpcap >= 2.77
- go >= 1.23.0

### Installation

_Below is an example of how you can instruct your audience on installing and setting up your app. This template doesn't rely on any external dependencies or services._

1. Clone the repo
   ```sh
   git clone https://github.com/Hyperloop-UPV/Hyperloop.git
   ```
2. Install NPM packages of frontend
   ```sh
   cd frontend && npm install
   ```
3. Run frontend
   ```sh
   npm run dev # at frontend/
   ```
4. Install Go dependencies
   ```sh
   cd backend/ && go mod tidy
   ```
5. Run backend
   ```sh
   cd cmd && sudo go run
   ```



<p align="right">(<a href="#readme-top">back to top</a>)</p>



<!-- USAGE EXAMPLES -->
## Usage

Hypervisor is built to be used in a Linux OS

1. Download latest release and unzip it
2. Run preconfiguration script 
   ```
   sudo ./setup_hypervisor.sh
   ```
3. Run hypervisor
   ```
   sudo ./hypervisor
   ```

<p align="right">(<a href="#readme-top">back to top</a>)</p>



## Contributors


- [Javier Ribal del Río](https://github.com/JavierRibaldelRio) - Backend & Network
- [Lola Castelló Puchades](https://github.com/l-castel) - Frontend




<!-- LICENSE -->
## License

Distributed under the GNU GENERAL PUBLIC LICENSE. See `LICENSE` for more information.

<p align="right">(<a href="#readme-top">back to top</a>)</p>


> Made at [Hyperloop UPV]()

<!-- Badges -->
[Go-badge]: https://img.shields.io/badge/Go-00ADD8?style=for-the-badge&logo=go&logoColor=white
[Go-url]: https://go.dev/

[React-badge]: https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB
[React-url]: https://react.dev/

[TS-badge]: https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white
[TS-url]: https://www.typescriptlang.org/