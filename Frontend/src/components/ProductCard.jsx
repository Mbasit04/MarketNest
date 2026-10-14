import { useRef, useState } from "react";
import { Link } from "react-router-dom";

export default function ProductCard({ product }) {
  const price = product.Price * (1 - (product.Discount || 0) / 100);
  const images = product.Images?.length
    ? product.Images.map((i) => i.FilePath)
    : [];
  const carouselRef = useRef(null);
  const [activeImg, setActiveImg] = useState(0);

  function scroll(dir) {
    if (!carouselRef.current || images.length < 2) return;
    const w = carouselRef.current.clientWidth;
    carouselRef.current.scrollBy({ left: dir * w, behavior: "smooth" });
  }

  function onScroll() {
    if (!carouselRef.current) return;
    const w = carouselRef.current.clientWidth;
    const idx = Math.round(carouselRef.current.scrollLeft / w);
    setActiveImg(idx);
  }

  return (
    <Link to={`/product/${product.Id}`} className="mn-product-card">
      <div className="mn-product-image">
        {images.length > 0 ? (
          <>
            <div
              className="mn-product-carousel"
              ref={carouselRef}
              onScroll={onScroll}
            >
              {images.map((src, idx) => (
                <img key={idx} src={src} alt={`${product.Name} ${idx + 1}`} />
              ))}
            </div>
            {images.length > 1 && (
              <>
                <button
                  className="mn-carousel-arrow left"
                  onClick={(e) => { e.preventDefault(); scroll(-1); }}
                  aria-label="Previous image"
                >
                  ‹
                </button>
                <button
                  className="mn-carousel-arrow right"
                  onClick={(e) => { e.preventDefault(); scroll(1); }}
                  aria-label="Next image"
                >
                  ›
                </button>
                <div className="mn-carousel-dots">
                  {images.map((_, idx) => (
                    <span key={idx} className={idx === activeImg ? "active" : ""} />
                  ))}
                </div>
              </>
            )}
          </>
        ) : (
          <div className="mn-product-placeholder">{product.Name?.[0]}</div>
        )}
        {product.Discount > 0 && <span className="mn-discount-tag">Sale</span>}
        {product.Discount === 0 && <span className="mn-new-tag">New</span>}
        <span className="mn-vendor-badge" title="Verified by admin">
          Verified
        </span>
      </div>
      <div className="mn-product-info">
        <span className="mn-product-cat">{product.Category?.Name || product.Brand}</span>
        <h4 className="mn-product-name">{product.Name}</h4>
        {product.Shop?.ShopName && (
          <div className="mn-product-shop">
            <span className="mn-product-shop-icon">S</span>
            {product.Shop.ShopName}
          </div>
        )}
        <div className="mn-product-price">
          {product.Discount > 0 && (
            <span className="mn-price-old">Rs. {product.Price.toLocaleString()}</span>
          )}
          <span className="mn-price-new">Rs. {Math.round(price).toLocaleString()}</span>
        </div>
      </div>
    </Link>
  );
}