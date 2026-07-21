<div align="center">

# 🤖 C.O.M.P.A.C.T. (Namakshar's Virtual Companion)

**Central Operation & Multi-agent Productivity Assistant for Compounded Tasks**
*Personal AI, On Personal Devices.*

[![arXiv](https://img.shields.io/badge/arXiv-2605.17172-b31b1b.svg)](https://arxiv.org)
[![Project](https://img.shields.io/badge/Project-COMPACT-blue.svg)](https://github.com/JohnNathanieal/COMPACT-Virtual-Companion)
[![Python](https://img.shields.io/badge/Python-3.10+-3776AB.svg?logo=python&logoColor=white)](https://python.org)
[![License: Apache 2.0](https://img.shields.io/badge/License-Apache_2.0-green.svg)](https://opensource.org/licenses/Apache-2.0)
[![Discord](https://img.shields.io/badge/Discord-Join-7289DA.svg?logo=discord&logoColor=white)](https://discord.gg)

</div>

---

<div align="center">

[Documentation](#) | [Project Site](#) | [Paper](#) | [Leaderboard](#) | [Roadmap](#)

</div>

---

## Why C.O.M.P.A.C.T.?

Personal AI agents are exploding in popularity, but nearly all of them still route intelligence through cloud APIs. Your "personal" AI continues to depend on someone else's server. At the same time, local language models already handle the vast majority of single-turn chat and reasoning queries with incredible speed and efficiency. The models and hardware are increasingly ready. What has been missing is the software stack to make local-first personal AI practical.

**C.O.M.P.A.C.T.** (*Central Operation & Multi-agent Productivity Assistant for Compounded Tasks*) is that stack. It is a framework for local-first personal AI, built around three core ideas: shared primitives for building on-device agents; evaluations that treat energy, latency, and resource costs as first-class constraints alongside accuracy; and a learning loop that improves models using local context data. The goal is simple: make it possible to build personal AI agents that run locally by default, calling external models only when necessary.

---

## Installation

Pick your platform and run one command. Each installer handles virtual environments, dependencies, Ollama, and a starter model.

| Platform | One-liner |
| :--- | :--- |
| **macOS · Linux · WSL2** | `curl -fsSL https://raw.githubusercontent.com/JohnNathanieal/COMPACT-Virtual-Companion/main/install.sh \| bash` |
| **Native Windows** | `irm https://raw.githubusercontent.com/JohnNathanieal/COMPACT-Virtual-Companion/main/install.ps1 \| iex` |
| **Desktop GUI** | Download `.exe` / `.dmg` / `.deb` / `.AppImage` from the latest release |

Then run `compact` to start.

---

## Quick Start

```bash
compact                           # Start chatting (default: chat-simple)
compact init --preset <name>      # Switch to a starter config
