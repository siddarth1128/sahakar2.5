import React, { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import DashboardLayout from "../components/DashboardLayout";
import toast from "react-hot-toast";
import "../styles/Dashboard.css";
import "../styles/TechniciansList.css";

const TechniciansList = () => {
  // State management
  const [technicians, setTechnicians] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [aiSuggestions, setAiSuggestions] = useState([]);
  const [hoveredCard, setHoveredCard] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  const [broadcastMode, setBroadcastMode] = useState(false);

  // Filters state
  const [filters, setFilters] = useState({
    services: [],
    availability: "",
    rating: 0,
    distance: 50,
    minPrice: 0,
    maxPrice: 10000,
    verified: false,
    emergency: false,
  });

  const [sortBy, setSortBy] = useState("recommended");
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 12,
    total: 0,
    pages: 0,
  });

  // Active filter chips
  const [activeFilters, setActiveFilters] = useState([]);

  // Mock AI suggestions based on search
  const aiSuggestionsData = {
    leak: "Plumbing",
    pipe: "Plumbing",
    water: "Plumbing",
    electrical: "Electrical",
    socket: "Electrical",
    switch: "Electrical",
    ac: "AC Repair",
    cooling: "AC Repair",
    air: "AC Repair",
    paint: "Painting",
    clean: "Cleaning",
    carpentry: "Carpentry",
    wood: "Carpentry",
  };

  // AI Search handler
  const handleSearchChange = (e) => {
    const query = e.target.value;
    setSearchQuery(query);

    // AI suggestions logic
    if (query.length > 2) {
      const suggestions = Object.keys(aiSuggestionsData)
        .filter((keyword) =>
          keyword.toLowerCase().includes(query.toLowerCase()),
        )
        .map((keyword) => aiSuggestionsData[keyword])
        .filter((value, index, self) => self.indexOf(value) === index)
        .slice(0, 3);
      setAiSuggestions(suggestions);
    } else {
      setAiSuggestions([]);
    }
  };

  const handleAiSuggestionClick = (service) => {
    setFilters((prev) => ({
      ...prev,
      services: [service],
    }));
    updateActiveFilters({ ...filters, services: [service] });
    setSearchQuery("");
    setAiSuggestions([]);
  };

  // Filter handlers
  const updateFilters = (newFilters) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
    updateActiveFilters({ ...filters, ...newFilters });
  };

  const updateActiveFilters = (currentFilters) => {
    const active = [];

    if (currentFilters.services && currentFilters.services.length > 0) {
      currentFilters.services.forEach((service) =>
        active.push({ type: "service", value: service, icon: "🔧" }),
      );
    }
    if (currentFilters.rating > 0) {
      active.push({
        type: "rating",
        value: `${currentFilters.rating}+ ⭐`,
        icon: "⭐",
      });
    }
    if (currentFilters.distance < 50) {
      active.push({
        type: "distance",
        value: `<${currentFilters.distance}km`,
        icon: "📍",
      });
    }
    if (currentFilters.availability) {
      active.push({ type: "availability", value: "Available", icon: "🟢" });
    }
    if (currentFilters.verified) {
      active.push({ type: "verified", value: "Verified", icon: "✓" });
    }

    setActiveFilters(active);
  };

  const removeFilter = (filter) => {
    if (filter.type === "service") {
      setFilters((prev) => ({
        ...prev,
        services: prev.services.filter((s) => s !== filter.value),
      }));
    } else if (filter.type === "rating") {
      setFilters((prev) => ({
        ...prev,
        rating: 0,
      }));
    } else if (filter.type === "distance") {
      setFilters((prev) => ({
        ...prev,
        distance: 50,
      }));
    } else if (filter.type === "availability") {
      setFilters((prev) => ({
        ...prev,
        availability: "",
      }));
    } else if (filter.type === "verified") {
      setFilters((prev) => ({
        ...prev,
        verified: false,
      }));
    }
    updateActiveFilters(filters);
  };

  // Fetch technicians from API
  const fetchTechnicians = useCallback(async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        toast.error("Please login to view technicians");
        setLoading(false);
        return;
      }

      // Build query parameters
      const queryParams = new URLSearchParams({
        page: pagination.page,
        limit: pagination.limit,
      });

      if (filters.services && filters.services.length > 0) {
        queryParams.append("services", filters.services.join(","));
      }
      if (filters.availability) {
        queryParams.append("availability", filters.availability);
      }
      if (filters.rating > 0) {
        queryParams.append("rating", filters.rating);
      }

      const baseUrl = (
        process.env.REACT_APP_API_URL || "http://localhost:5000"
      ).replace(/\/api$/, "");
      const response = await fetch(
        `${baseUrl}/api/users/technicians?${queryParams}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        },
      );

      if (!response.ok) {
        throw new Error("Failed to fetch technicians");
      }

      const data = await response.json();

      if (data.success) {
        // Transform the data to match the frontend structure
        const transformedTechnicians = data.data.technicians.map((tech) => ({
          id: tech._id,
          firstName: tech.firstName,
          lastName: tech.lastName,
          avatar:
            tech.avatar ||
            `https://ui-avatars.com/api/?name=${tech.firstName}+${tech.lastName}&background=667eea&color=fff`,
          rating: tech.technicianDetails?.rating || 0,
          reviewCount: tech.technicianDetails?.totalReviews || 0,
          services: tech.technicianDetails?.services || [],
          availability: tech.technicianDetails?.availability || "offline",
          distance: Math.round(Math.random() * 20 + 1), // Mock distance for now
          priceRange: tech.technicianDetails?.hourlyRate
            ? `₹${tech.technicianDetails.hourlyRate}-₹${tech.technicianDetails.hourlyRate * 2}`
            : "₹400-₹1200",
          responseTime: Math.round(Math.random() * 10 + 1), // Mock response time
          totalJobs: tech.technicianDetails?.completedJobs || 0,
          isVerified: tech.isVerified || false,
          bio: tech.technicianDetails?.bio || "",
          tags: [
            ...(tech.isVerified ? ["Verified"] : []),
            ...(tech.technicianDetails?.rating >= 4.5 ? ["Top Rated"] : []),
            ...(tech.technicianDetails?.availability === "available"
              ? ["Available Now"]
              : []),
          ],
          email: tech.email,
          phone: tech.phone,
        }));

        // Apply client-side sorting
        let sortedTechnicians = [...transformedTechnicians];
        if (sortBy === "nearest") {
          sortedTechnicians.sort((a, b) => a.distance - b.distance);
        } else if (sortBy === "rating") {
          sortedTechnicians.sort((a, b) => b.rating - a.rating);
        } else if (sortBy === "price_low") {
          sortedTechnicians.sort((a, b) => {
            const aPrice = parseInt(
              a.priceRange.split("–")[0].replace("₹", ""),
            );
            const bPrice = parseInt(
              b.priceRange.split("–")[0].replace("₹", ""),
            );
            return aPrice - bPrice;
          });
        }

        setTechnicians(sortedTechnicians);
        setPagination((prev) => ({
          ...prev,
          total: data.data.pagination?.total || sortedTechnicians.length,
          pages: data.data.pagination?.pages || 1,
        }));
      } else {
        throw new Error(data.message || "Failed to fetch technicians");
      }
    } catch (error) {
      console.error("Error fetching technicians:", error);
      toast.error(error.message || "Failed to load technicians");
      setTechnicians([]);
    } finally {
      setLoading(false);
    }
  }, [filters, sortBy, pagination.page, pagination.limit]);

  useEffect(() => {
    fetchTechnicians();
  }, [fetchTechnicians]);

  // Status badge component
  const StatusBadge = ({ status }) => {
    const statusConfig = {
      available: { text: "Available Now", color: "#10b981", icon: "🟢" },
      busy: { text: "Busy", color: "#f59e0b", icon: "🟡" },
      offline: { text: "Offline", color: "#6b7280", icon: "⚪" },
    };

    const config = statusConfig[status] || statusConfig.offline;

    return (
      <div
        className={`status-badge ${status === "available" ? "pulse" : ""}`}
        style={{
          backgroundColor: config.color,
          color: "white",
          padding: "4px 8px",
          borderRadius: "12px",
          fontSize: "0.75rem",
          fontWeight: "600",
          display: "flex",
          alignItems: "center",
          gap: "4px",
        }}
      >
        <span>{config.icon}</span>
        <span>{config.text}</span>
      </div>
    );
  };

  return (
    <DashboardLayout title="Find Technicians">
      <div className="technicians-discovery">
        {/* Header Section */}
        <div className="page-header">
          <h1>Find Professional Technicians</h1>
          <p>Connect with verified professionals for all your service needs</p>
        </div>

        {/* Search Bar */}
        <div className="search-section">
          <div className="search-bar">
            <i className="fas fa-search"></i>
            <input
              type="text"
              placeholder="Search for technicians or describe your issue..."
              value={searchQuery}
              onChange={handleSearchChange}
              className="search-input"
            />
            <button className="voice-btn" title="Voice Search">
              <i className="fas fa-microphone"></i>
            </button>
          </div>

          {/* AI Suggestions */}
          {aiSuggestions.length > 0 && (
            <div className="suggestions">
              <span className="suggestion-label">Suggested services:</span>
              {aiSuggestions.map((service, index) => (
                <button
                  key={index}
                  className="suggestion-chip"
                  onClick={() => handleAiSuggestionClick(service)}
                >
                  {service}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Filter and Sort Section */}
        <div className="controls-section">
          <div className="controls-left">
            <button
              className="filter-btn"
              onClick={() => setShowFilters(!showFilters)}
            >
              <i className="fas fa-filter"></i>
              Filters
              {activeFilters.length > 0 && (
                <span className="filter-count">{activeFilters.length}</span>
              )}
            </button>

            {/* Active Filters */}
            {activeFilters.length > 0 && (
              <div className="active-filters">
                {activeFilters.map((filter, index) => (
                  <span key={index} className="filter-chip">
                    {filter.icon} {filter.value}
                    <button
                      onClick={() => removeFilter(filter)}
                      className="chip-remove"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          <div className="controls-right">
            <div className="sort-section">
              <label>Sort by:</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="sort-select"
              >
                <option value="recommended">Recommended</option>
                <option value="rating">Highest Rated</option>
                <option value="nearest">Nearest</option>
                <option value="price_low">Price: Low to High</option>
              </select>
            </div>

            <div className="results-count">
              {technicians.length} technician
              {technicians.length !== 1 ? "s" : ""} found
            </div>
          </div>
        </div>

        {/* Filter Panel */}
        {showFilters && (
          <div className="filter-overlay" onClick={() => setShowFilters(false)}>
            <div className="filter-panel" onClick={(e) => e.stopPropagation()}>
              <div className="filter-header">
                <h3>Filters</h3>
                <button
                  className="close-btn"
                  onClick={() => setShowFilters(false)}
                >
                  <i className="fas fa-times"></i>
                </button>
              </div>

              <div className="filter-content">
                {/* Service Types */}
                <div className="filter-group">
                  <label className="filter-label">Service Types</label>
                  <div className="service-grid">
                    {[
                      "Plumbing",
                      "Electrical",
                      "Carpentry",
                      "Painting",
                      "AC Repair",
                      "Cleaning",
                      "Appliance Repair",
                      "Pest Control",
                    ].map((service) => (
                      <button
                        key={service}
                        className={`service-btn ${filters.services.includes(service) ? "active" : ""}`}
                        onClick={() => {
                          const newServices = filters.services.includes(service)
                            ? filters.services.filter((s) => s !== service)
                            : [...filters.services, service];
                          updateFilters({ services: newServices });
                        }}
                      >
                        {service}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Rating Filter */}
                <div className="filter-group">
                  <label className="filter-label">Minimum Rating</label>
                  <div className="rating-filter">
                    {[4, 3, 2, 1].map((rating) => (
                      <button
                        key={rating}
                        className={`rating-btn ${filters.rating === rating ? "active" : ""}`}
                        onClick={() =>
                          updateFilters({
                            rating: filters.rating === rating ? 0 : rating,
                          })
                        }
                      >
                        <div className="stars">
                          {Array.from({ length: 5 }, (_, i) => (
                            <i
                              key={i}
                              className={`fas fa-star ${i < rating ? "active" : ""}`}
                            ></i>
                          ))}
                        </div>
                        <span>{rating}+ Stars</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Availability Filter */}
                <div className="filter-group">
                  <label className="filter-label">Availability</label>
                  <div className="availability-options">
                    {[
                      { value: "", label: "Any Time" },
                      { value: "available", label: "Available Now" },
                      { value: "busy", label: "Busy" },
                    ].map((option) => (
                      <button
                        key={option.value}
                        className={`availability-btn ${filters.availability === option.value ? "active" : ""}`}
                        onClick={() =>
                          updateFilters({
                            availability:
                              filters.availability === option.value
                                ? ""
                                : option.value,
                          })
                        }
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Quick Toggles */}
                <div className="filter-group">
                  <label className="filter-label">Preferences</label>
                  <div className="toggle-options">
                    <label className="toggle-item">
                      <input
                        type="checkbox"
                        checked={filters.verified}
                        onChange={(e) =>
                          updateFilters({ verified: e.target.checked })
                        }
                      />
                      <span className="toggle-text">Verified Only</span>
                    </label>
                    <label className="toggle-item">
                      <input
                        type="checkbox"
                        checked={filters.emergency}
                        onChange={(e) =>
                          updateFilters({ emergency: e.target.checked })
                        }
                      />
                      <span className="toggle-text">Emergency Service</span>
                    </label>
                  </div>
                </div>

                {/* Filter Actions */}
                <div className="filter-actions">
                  <button
                    className="btn-outline"
                    onClick={() => {
                      setFilters({
                        services: [],
                        availability: "",
                        rating: 0,
                        distance: 50,
                        minPrice: 0,
                        maxPrice: 10000,
                        verified: false,
                        emergency: false,
                      });
                      setActiveFilters([]);
                    }}
                  >
                    Clear All
                  </button>
                  <button
                    className="btn-primary"
                    onClick={() => setShowFilters(false)}
                  >
                    Apply Filters
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Technicians Grid */}
        <div className="technicians-grid">
          {loading ? (
            <div className="loading-grid">
              {Array.from({ length: 6 }, (_, i) => (
                <div key={i} className="technician-skeleton">
                  <div className="skeleton-avatar"></div>
                  <div className="skeleton-content">
                    <div className="skeleton-line"></div>
                    <div className="skeleton-line short"></div>
                    <div className="skeleton-line"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : technicians.length > 0 ? (
            technicians.map((tech) => (
              <div
                key={tech.id}
                className={`technician-card ${hoveredCard === tech.id ? "hovered" : ""}`}
                onMouseEnter={() => setHoveredCard(tech.id)}
                onMouseLeave={() => setHoveredCard(null)}
              >
                <div className="card-header">
                  <div className="technician-avatar">
                    <img
                      src={tech.avatar}
                      alt={`${tech.firstName} ${tech.lastName}`}
                      className="avatar-image"
                      onError={(e) => {
                        e.target.src = `https://ui-avatars.com/api/?name=${tech.firstName}+${tech.lastName}&background=667eea&color=fff`;
                      }}
                    />
                    <StatusBadge status={tech.availability} />
                  </div>

                  {tech.isVerified && (
                    <div className="verified-badge">
                      <i className="fas fa-check-circle"></i>
                    </div>
                  )}
                </div>

                <div className="card-body">
                  <h3 className="technician-name">
                    {tech.firstName} {tech.lastName}
                  </h3>

                  <div className="rating-section">
                    <div className="rating-stars">
                      {Array.from({ length: 5 }, (_, i) => (
                        <i
                          key={i}
                          className={`fas fa-star ${i < Math.floor(tech.rating) ? "active" : ""}`}
                        ></i>
                      ))}
                    </div>
                    <span className="rating-text">
                      {tech.rating > 0 ? tech.rating.toFixed(1) : "New"}
                    </span>
                    {tech.reviewCount > 0 && (
                      <span className="review-count">
                        ({tech.reviewCount} reviews)
                      </span>
                    )}
                  </div>

                  <div className="services-section">
                    <p className="services-text">
                      {tech.services.length > 0
                        ? tech.services.slice(0, 2).join(", ")
                        : "General Services"}
                      {tech.services.length > 2 &&
                        ` +${tech.services.length - 2} more`}
                    </p>
                  </div>

                  <div className="details-section">
                    <div className="detail-item">
                      <i className="fas fa-map-marker-alt"></i>
                      <span>{tech.distance} km away</span>
                    </div>
                    <div className="detail-item">
                      <i className="fas fa-clock"></i>
                      <span>~{tech.responseTime} min response</span>
                    </div>
                  </div>

                  <div className="price-section">
                    <span className="price-range">{tech.priceRange}</span>
                    <span className="price-unit">per hour</span>
                  </div>

                  {tech.tags && tech.tags.length > 0 && (
                    <div className="tags-section">
                      {tech.tags.slice(0, 2).map((tag, index) => (
                        <span key={index} className="tag">
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <div className="card-actions">
                  <Link
                    to={`/technicians/${tech.id}`}
                    className="btn-outline btn-sm"
                  >
                    View Profile
                  </Link>
                  <Link
                    to={`/book-service?technician=${tech.id}&service=${tech.services[0] || ""}`}
                    className="btn-primary btn-sm"
                  >
                    Book Now
                  </Link>
                </div>
              </div>
            ))
          ) : (
            <div className="empty-state">
              <div className="empty-icon">
                <i className="fas fa-search"></i>
              </div>
              <h3>No Technicians Found</h3>
              <p>Try adjusting your search criteria or filters</p>
              <button
                className="btn-primary"
                onClick={() => {
                  setFilters({
                    services: [],
                    availability: "",
                    rating: 0,
                    distance: 50,
                    minPrice: 0,
                    maxPrice: 10000,
                    verified: false,
                    emergency: false,
                  });
                  setActiveFilters([]);
                  setSearchQuery("");
                }}
              >
                Clear All Filters
              </button>
            </div>
          )}
        </div>

        {/* Pagination */}
        {pagination.pages > 1 && (
          <div className="pagination">
            <button
              onClick={() =>
                setPagination((prev) => ({
                  ...prev,
                  page: Math.max(1, prev.page - 1),
                }))
              }
              disabled={pagination.page === 1}
              className="pagination-btn"
            >
              <i className="fas fa-chevron-left"></i>
              Previous
            </button>

            <div className="pagination-info">
              <span>
                Page {pagination.page} of {pagination.pages}
              </span>
            </div>

            <button
              onClick={() =>
                setPagination((prev) => ({
                  ...prev,
                  page: Math.min(pagination.pages, prev.page + 1),
                }))
              }
              disabled={pagination.page === pagination.pages}
              className="pagination-btn"
            >
              Next
              <i className="fas fa-chevron-right"></i>
            </button>
          </div>
        )}

        {/* Broadcast FAB */}
        <button
          className="broadcast-fab"
          onClick={() => setBroadcastMode(true)}
          title="Broadcast your service request"
        >
          <i className="fas fa-bullhorn"></i>
          <span className="fab-text">Broadcast</span>
        </button>

        {/* Broadcast Modal */}
        {broadcastMode && (
          <div
            className="modal-overlay"
            onClick={() => setBroadcastMode(false)}
          >
            <div
              className="broadcast-modal"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="modal-header">
                <h3>
                  <i className="fas fa-bullhorn"></i>
                  Broadcast Your Service Request
                </h3>
                <button
                  className="close-btn"
                  onClick={() => setBroadcastMode(false)}
                >
                  <i className="fas fa-times"></i>
                </button>
              </div>

              <div className="modal-body">
                <div className="broadcast-form">
                  <div className="form-group">
                    <label>Describe your issue</label>
                    <textarea
                      placeholder="e.g., My kitchen sink is leaking and needs immediate repair..."
                      rows="4"
                      className="form-textarea"
                    />
                  </div>

                  <div className="form-group">
                    <label>Service Category</label>
                    <select className="form-select">
                      <option value="">Select category...</option>
                      <option value="plumbing">Plumbing</option>
                      <option value="electrical">Electrical</option>
                      <option value="carpentry">Carpentry</option>
                      <option value="painting">Painting</option>
                      <option value="cleaning">Cleaning</option>
                      <option value="other">Other</option>
                    </select>
                  </div>

                  <div className="form-options">
                    <label className="checkbox-item">
                      <input type="checkbox" defaultChecked />
                      <span>Share my location with technicians</span>
                    </label>
                    <label className="checkbox-item">
                      <input type="checkbox" />
                      <span>This is an emergency</span>
                    </label>
                    <label className="checkbox-item">
                      <input type="checkbox" />
                      <span>Allow technicians to call me directly</span>
                    </label>
                  </div>
                </div>
              </div>

              <div className="modal-footer">
                <button
                  className="btn-outline"
                  onClick={() => setBroadcastMode(false)}
                >
                  Cancel
                </button>
                <button
                  className="btn-primary"
                  onClick={() => {
                    toast.success("Broadcast sent to nearby technicians!");
                    setBroadcastMode(false);
                  }}
                >
                  Send Broadcast
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default TechniciansList;
