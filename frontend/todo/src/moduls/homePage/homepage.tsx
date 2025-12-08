import './homepage.css';
import heroImage from '../../assets/homepage_hero.png';
import PricniModal from "./pricniModal/pricniModal.tsx";
import PrijavaModal from "./prijavaModal/prijavaModal";
import {openLoginModal} from "./prijavaModal/prikazModal.ts";
import {openRegisterMOdal} from "./pricniModal/prikaziPricniModal.ts";


function Homepage() {
    function prijava_handler(): void {
        openLoginModal();
    }

    function registracija_handler(): void {
        openRegisterMOdal();
    }

    return (
        <div className="homepage">
            <header className="homepage-header">
                <div className="header-left">
                    <span className="logo-text">RIS To-Do</span>
                </div>

                <nav className="header-nav">
                    <a href="#kakodeluje">Kako deluje?</a>
                    <a href="https://github.com/PAKO25/ris_todo" target="_blank" rel="noreferrer">
                        GitHub
                    </a>
                    <a href="#collab">Colab</a>
                </nav>

                <div className="header-actions">
                    <button className="btn btn-ghost" onClick={prijava_handler}>Prijava</button>
                    <button className="btn btn-primary" onClick={registracija_handler}>Pričnimo</button>
                </div>
            </header>

            <main className="homepage-main">
                <section className="hero" aria-labelledby="hero-title">
                    <div className="hero-content">
                        <h1 id="hero-title" className="hero-title">
                            Kolaborativen todo za vse ekipe.
                        </h1>

                        <p className="hero-subtitle">Todo projekt za RIS je preprost kanban tabla za vse vrste manjših ekip, ki si želijo preprosto sodelovanje v realnem času!</p>

                        <div className="hero-cta">
                            <button className="btn btn-primary" onClick={() => (window.location.href = '/app')}>Ustvari board</button>
                            <button className="btn btn-secondary">Poglej demo board</button>
                        </div>

                        <div className="hero-meta" id="collab">
                            <div className="hero-avatars">
                                <div className="avatar avatar-po">PO</div>
                                <div className="avatar avatar-dev">DEV</div>
                                <div className="avatar avatar-analyst">AN</div>
                            </div>
                            <span className="hero-meta-text">
                Product owner, developerji in analitiki na enem kanban boardu – v realnem času.
              </span>
                        </div>
                    </div>

                    <div className="hero-visual">
                        <div className="hero-image-frame">
                            <img src={heroImage} alt="Hero slika" />
                        </div>
                    </div>
                </section>

                <section className="overview-section" id="kakodeluje">
                    <div className="overview-media">
                        <div className="video-placeholder">
                            <div className="video-inner">
                                <button type="button" className="video-play">
                                    <span className="video-play-icon">▶</span>
                                </button>
                                <p className="video-label">Kmalu: 2-minutni overview videa</p>
                            </div>
                        </div>
                    </div>
                    <div className="overview-content">
                        <h2>Kanban + colab, brez zapletov.</h2>
                        <p>Platforma je zasnovana za projekte in majhne ekipe, ki želijo deliti board. Gostujete jo lahko sam ali jo uporabiš kot lahek hub za svoje taske.</p>

                        <ul className="feature-list">
                            <li>Kanban stolpci <strong>To Do · In Progress · Review · Done</strong> z lepim dark mode izgledom.</li>
                            <li>Colab v realnem času – vidiš premike kartic, ko jih ekipa prestavi.</li>
                            <li>Idealno za product ownerje, dev ekipe in analitike, ki delajo na istem boardu.</li>
                            <li>100% open-source na GitHubu – forkaj, prilagodi in hostaj kjer želiš.</li>
                            <li>Inspired by <a href="https://dribbble.com/shots/21417623-Kanban-Board-View-Dark-Mode">Jin Yong - Kanban Board View - Dark Mode</a></li>
                        </ul>
                        <a href={"https://github.com/PAKO25/ris_todo/"}>
                            <div className="github-badge">
                                <span className="github-star">★</span>
                                <div className="github-text">
                                    <span>Podpri projekt na GitHubu</span>
                                    <span className="github-sub">RIS To-Do je povsem brezplačen in odprt.</span>
                                </div>
                            </div>
                        </a>
                    </div>
                </section>
            </main>
            <PrijavaModal />
            <PricniModal />
        </div>
    );
}

export default Homepage;
