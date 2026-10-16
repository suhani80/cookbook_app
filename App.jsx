

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import "./App.css";

const API = "https://www.themealdb.com/api/json/v1/1";

const categories = [
  "All",
  "Chicken",
  "Seafood",
  "Dessert",
  "Vegetarian",
  "Pasta",
  "Beef",
];

const foodImages = [
  "https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=1000&q=85",
  "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=1000&q=85",
  "https://images.unsplash.com/photo-1476224203421-9ac39bcb3327?auto=format&fit=crop&w=1000&q=85",
  "https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?auto=format&fit=crop&w=1000&q=85",
];

function getSavedFavorites() {
  try {
    return JSON.parse(localStorage.getItem("cookbook-favorites")) || [];
  } catch {
    return [];
  }
}

export default function App() {
  const [meals, setMeals] = useState([]);
  const [category, setCategory] = useState("All");
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [selectedMeal, setSelectedMeal] = useState(null);
  const [favorites, setFavorites] = useState(getSavedFavorites);
  const [showFavorites, setShowFavorites] = useState(false);

  const favoritesRef = useRef(null);
  const recipesRef = useRef(null);

  useEffect(() => {
    localStorage.setItem("cookbook-favorites", JSON.stringify(favorites));
  }, [favorites]);

  useEffect(() => {
    gsap.fromTo(
      ".hero-content",
      { opacity: 0, y: 35 },
      { opacity: 1, y: 0, duration: 1, ease: "power3.out" }
    );
  }, []);

  useEffect(() => {
    const loadMeals = async () => {
      setLoading(true);

      try {
        let url = `${API}/search.php?s=${encodeURIComponent(query)}`;

        if (!query && category !== "All") {
          url = `${API}/filter.php?c=${encodeURIComponent(category)}`;
        }

        const response = await fetch(url);
        const data = await response.json();

        let result = data.meals || [];

        if (query && category !== "All") {
          result = result.filter((meal) =>
            meal.strCategory?.toLowerCase() === category.toLowerCase()
          );
        }

        setMeals(result);
      } catch (error) {
        console.error("Unable to load recipes:", error);
        setMeals([]);
      } finally {
        setLoading(false);
      }
    };

    loadMeals();
  }, [query, category]);

  const toggleFavorite = (meal) => {
    setFavorites((previous) => {
      const exists = previous.some(
        (item) => item.idMeal === meal.idMeal
      );

      return exists
        ? previous.filter((item) => item.idMeal !== meal.idMeal)
        : [...previous, meal];
    });
  };

  const isFavorite = (mealId) =>
    favorites.some((item) => item.idMeal === mealId);

  const openFavorites = () => {
    setShowFavorites(true);

    requestAnimationFrame(() => {
      favoritesRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    });
  };

  const openRecipes = () => {
    setShowFavorites(false);
    setCategory("All");
    setQuery("");

    setTimeout(() => {
      recipesRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }, 100);
  };

  const displayedMeals = showFavorites ? favorites : meals;

  return (
    <div className="gourmet-site">
      <header className="topbar">
        <a href="#home" className="brand">
          <span className="brand-icon">✳</span>
          cookbook<span className="brand-dot">.</span>
        </a>

        <nav className="nav-links">
          <button
            className={!showFavorites ? "nav-link active" : "nav-link"}
            onClick={openRecipes}
          >
            Recipes
          </button>

          <a href="#about" className="nav-link">
            Our Story
          </a>

          <button
            className="favorites-btn"
            onClick={openFavorites}
          >
            ♥ Favorites ({favorites.length})
          </button>
        </nav>
      </header>

      <main>
        <section className="hero" id="home">
          <div className="hero-content">
            <p className="eyebrow">GOOD FOOD, GOOD MOOD</p>
            <h1>
              A little taste
              <br />
              of <em>something</em> special.
            </h1>   
            <p className="hero-description">
              Discover delicious recipes, and bring a little <br/>
              more joy to your kitchen.
            </p>

            <button className="gold-button" onClick={openRecipes}>
              Explore Recipes <span>↗</span>
            </button>
          </div>

          <div className="hero-image-wrap">
            <img
              className="hero-image"
              src={foodImages[0]}
              alt="Freshly prepared food"
            />
            <div className="hero-image-note">
              <span>✦</span>
              Made with love
            </div>
          </div>

          <div className="hero-side-note">FRESH IDEAS · EVERY DAY</div>
        </section>

        <section className="intro-section" id="about">
          <p className="eyebrow">A RECIPE FOR EVERY MOOD</p>
          <h2>
            Find your next
            <br />
            <em>favorite bite.</em>
          </h2>
          <p>
            From comforting classics to fresh new flavors, explore recipes
            that make everyday cooking feel special.
          </p>
        </section>

        <section
          className="recipe-section"
          id="favorites"
          ref={favoritesRef}
        >
          <div className="section-heading" ref={recipesRef}>
            <div>
              <p className="eyebrow">
                {showFavorites ? "YOUR COLLECTION" : "THE RECIPE COLLECTION"}
              </p>
              <h2>
                {showFavorites ? (
                  <>Your <em>favorites.</em></>
                ) : (
                  <>Something <em>delicious.</em></>
                )}
              </h2>
            </div>

            {showFavorites && (
              <button
                className="text-button"
                onClick={openRecipes}
              >
                ← All recipes
              </button>
            )}
          </div>

          {!showFavorites && (
            <>
              <div className="search-wrap">
                <span>⌕</span>
                <input
                  type="search"
                  placeholder="Search for a dish..."
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                />
              </div>

              <div className="category-list">
                {categories.map((item) => (
                  <button
                    key={item}
                    className={
                      category === item
                        ? "category-chip selected"
                        : "category-chip"
                    }
                    onClick={() => setCategory(item)}
                  >
                    {item}
                  </button>
                ))}
              </div>
            </>
          )}

          {loading && !showFavorites ? (
            <div className="status-message">
              <div className="loader" />
              Finding something delicious...
            </div>
          ) : displayedMeals.length === 0 ? (
            <div className="empty-state">
              <span className="empty-icon">♡</span>
              <h3>
                {showFavorites
                  ? "No favorites just yet"
                  : "No recipes found"}
              </h3>
              <p>
                {showFavorites
                  ? "Tap the heart on any recipe to save it here."
                  : "Try another search or choose a different category."}
              </p>

              {showFavorites && (
                <button className="gold-button" onClick={openRecipes}>
                  Explore recipes <span>↗</span>
                </button>
              )}
            </div>
          ) : (
            <div className="recipe-grid">
              {displayedMeals.map((meal, index) => (
                <article className="recipe-card" key={meal.idMeal}>
                  <div
                    className="recipe-image-wrap"
                    onClick={() => setSelectedMeal(meal)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(event) => {
                      if (event.key === "Enter") setSelectedMeal(meal);
                    }}
                  >
                    <img
                      src={
                        meal.strMealThumb ||
                        foodImages[index % foodImages.length]
                      }
                      alt={meal.strMeal}
                      loading="lazy"
                    />

                    <span className="recipe-number">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                  </div>

                  <div className="recipe-card-content">
                    <div className="recipe-meta">
                      <span>{meal.strCategory || category}</span>
                      <span>✦ Reader's pick</span>
                    </div>

                    <h3>{meal.strMeal}</h3>

                    <div className="recipe-card-bottom">
                      <button
                        className="view-recipe"
                        onClick={() => setSelectedMeal(meal)}
                      >
                        View recipe <span>↗</span>
                      </button>

                      <button
                        className={
                          isFavorite(meal.idMeal)
                            ? "heart-btn is-favorite"
                            : "heart-btn"
                        }
                        aria-label={
                          isFavorite(meal.idMeal)
                            ? "Remove from favorites"
                            : "Add to favorites"
                        }
                        onClick={() => toggleFavorite(meal)}
                      >
                        {isFavorite(meal.idMeal) ? "♥" : "♡"}
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>

        <section className="quote-banner">
          <span className="quote-mark">“</span>
          <p>
            Cooking is about creating something
            <br />
            <em>beautiful to share.</em>
          </p>
          <span className="quote-decoration">✳</span>
        </section>

        <section className="gallery-section">
          <div className="section-heading">
            <div>
              <p className="eyebrow">A FEAST FOR THE EYES</p>
              <h2>
                Fresh from the <em>kitchen.</em>
              </h2>
            </div>
          </div>

          <div className="food-gallery">
            {foodImages.map((image, index) => (
              <div className="gallery-image" key={image}>
                <img src={image} alt={`Food inspiration ${index + 1}`} loading="lazy" />
              </div>
            ))}
          </div>
        </section>
      </main>

      <footer className="site-footer">
        <a href="#home" className="brand">
          <span className="brand-icon">✳</span>
          cookbook<span className="brand-dot">.</span>
        </a>

        <p>Made with love and a little extra seasoning.</p>

        <a href="#home" className="back-top">
          Back to top ↑
        </a>
      </footer>

      {selectedMeal && (
        <div
          className="modal-overlay"
          onClick={() => setSelectedMeal(null)}
          role="presentation"
        >
          <div
            className="recipe-modal"
            role="dialog"
            aria-modal="true"
            aria-label={selectedMeal.strMeal}
            onClick={(event) => event.stopPropagation()}
          >
            <button
              className="modal-close"
              onClick={() => setSelectedMeal(null)}
              aria-label="Close recipe"
            >
              ×
            </button>

            <img
              className="modal-image"
              src={selectedMeal.strMealThumb}
              alt={selectedMeal.strMeal}
            />

            <div className="modal-content">
              <p className="eyebrow">
                {selectedMeal.strCategory || "RECIPE"}
              </p>

              <h2>{selectedMeal.strMeal}</h2>

              {selectedMeal.strArea && (
                <p className="modal-area">
                  Origin: {selectedMeal.strArea}
                </p>
              )}

              {selectedMeal.strInstructions && (
                <>
                  <h3>Let's make it</h3>
                  <p className="instructions">
                    {selectedMeal.strInstructions}
                  </p>
                </>
              )}

              <button
                className="gold-button modal-favorite"
                onClick={() => toggleFavorite(selectedMeal)}
              >
                {isFavorite(selectedMeal.idMeal)
                  ? "♥ Remove from Favorites"
                  : "♡ Add to Favorites"}
              </button>

              {selectedMeal.strSource && (
                <a
                  className="source-link"
                  href={selectedMeal.strSource}
                  target="_blank"
                  rel="noreferrer"
                >
                  Original recipe ↗
                </a>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
