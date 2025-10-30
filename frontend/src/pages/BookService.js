import React, { useState, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useCustomerStats } from "../context/CustomerStatsContext";
import axios from "axios";
import toast from "react-hot-toast";
import DashboardLayout from "../components/DashboardLayout";
import "../styles/Dashboard.css";
import "../styles/BookService.css";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000/api";

const BookService = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { onBookingCreated } = useCustomerStats();

  const services = [
    { id: "plumbing", name: "Plumbing", icon: "fas fa-wrench", price: 75 },
    { id: "electrical", name: "Electrical", icon: "fas fa-bolt", price: 85 },
    {
      id: "painting",
      name: "Painting",
      icon: "fas fa-paint-roller",
      price: 65,
    },
    { id: "cleaning", name: "Cleaning", icon: "fas fa-broom", price: 50 },
    { id: "hvac", name: "HVAC", icon: "fas fa-wind", price: 95 },
    { id: "carpentry", name: "Carpentry", icon: "fas fa-hammer", price: 80 },
  ];

  const timeSlots = [
    "08:00 AM",
    "09:00 AM",
    "10:00 AM",
    "11:00 AM",
    "12:00 PM",
    "01:00 PM",
    "02:00 PM",
    "03:00 PM",
    "04:00 PM",
    "05:00 PM",
    "06:00 PM",
  ];

  const [formData, setFormData] = useState({
    technicianId: searchParams.get("technician") || "",
    service: searchParams.get("service") || "",
    serviceType: searchParams.get("service") || "",
    date: "",
    time: "",
    address: "",
    city: "",
    state: "",
    zipCode: "",
    description: "",
    urgency: "normal",
    notes: "",
  });

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [step, setStep] = useState(1);
  const [technician, setTechnician] = useState(null);

  useEffect(() => {
    const preSelectedService = searchParams.get("service");
    const preSelectedTechnician = searchParams.get("technician");

    if (preSelectedService) {
      setFormData((prev) => ({
        ...prev,
        service: preSelectedService,
        serviceType: preSelectedService,
      }));
    }

    if (preSelectedTechnician) {
      setFormData((prev) => ({ ...prev, technicianId: preSelectedTechnician }));
      fetchTechnicianDetails(preSelectedTechnician);
    }
  }, [searchParams]);

  const fetchTechnicianDetails = async (technicianId) => {
    if (!technicianId) return;

    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(`${API_URL}/users/${technicianId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.data.success) {
        setTechnician(response.data.data.user);
      }
    } catch (error) {
      console.error("Error fetching technician:", error);
      toast.error("Could not load technician details");
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validateStep1 = () => {
    const newErrors = {};

    if (!formData.service) {
      newErrors.service = "Please select a service";
    }

    if (!formData.date) {
      newErrors.date = "Please select a date";
    } else {
      const selectedDate = new Date(formData.date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (selectedDate < today) {
        newErrors.date = "Please select a future date";
      }
    }

    if (!formData.time) {
      newErrors.time = "Please select a time";
    }

    if (!formData.description || formData.description.trim().length < 10) {
      newErrors.description =
        "Please provide a description (at least 10 characters)";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep2 = () => {
    const newErrors = {};

    if (!formData.address.trim()) {
      newErrors.address = "Street address is required";
    }

    if (!formData.city.trim()) {
      newErrors.city = "City is required";
    }

    if (!formData.state.trim()) {
      newErrors.state = "State is required";
    }

    if (!formData.zipCode.trim()) {
      newErrors.zipCode = "ZIP code is required";
    } else if (!/^\d{5}(-\d{4})?$/.test(formData.zipCode)) {
      newErrors.zipCode = "Invalid ZIP code";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (step === 1 && validateStep1()) {
      setStep(2);
      window.scrollTo(0, 0);
    } else if (step === 2 && validateStep2()) {
      setStep(3);
      window.scrollTo(0, 0);
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
      window.scrollTo(0, 0);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateStep1() || !validateStep2()) {
      toast.error("Please complete all required fields");
      setStep(1);
      return;
    }

    setLoading(true);

    try {
      const token = localStorage.getItem("token");

      if (!token) {
        toast.error("Please log in to book a service");
        navigate("/login");
        return;
      }

      // Prepare booking data
      const bookingData = {
        technicianId: formData.technicianId || undefined,
        serviceType: formData.service,
        description: formData.description,
        title: `${formData.service} Service`,
        date: new Date(formData.date).toISOString(),
        time: formData.time,
        location: {
          address: formData.address,
          city: formData.city,
          state: formData.state,
          zipCode: formData.zipCode,
        },
        notes: formData.notes || "",
        urgency: formData.urgency,
        priority: formData.urgency === "urgent" ? "urgent" : "normal",
        isEmergency: formData.urgency === "urgent",
        bookingType: formData.technicianId ? "precision" : "broadcast",
      };

      // Calculate pricing
      const service = services.find((s) => s.id === formData.service);
      const basePrice = service ? service.price : 75;
      const urgencyFee = formData.urgency === "urgent" ? 25 : 0;

      bookingData.pricing = {
        basePrice: basePrice,
        urgencyFee: urgencyFee,
        distanceFee: 0,
        additionalCharges: [],
        discount: 0,
        totalPrice: basePrice + urgencyFee,
      };

      console.log("Submitting booking:", bookingData);

      const response = await axios.post(`${API_URL}/bookings`, bookingData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (response.data.success) {
        toast.success("Service booked successfully!");

        // Update stats after successful booking
        onBookingCreated();

        // Navigate based on booking type
        if (formData.technicianId) {
          navigate("/customer/bookings", {
            state: {
              message: "Your booking request has been sent to the technician",
            },
          });
        } else {
          navigate("/customer/bookings", {
            state: {
              message: "Your request has been broadcast to nearby technicians",
            },
          });
        }
      } else {
        throw new Error(response.data.message || "Booking failed");
      }
    } catch (error) {
      console.error("Booking error:", error);
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Failed to book service. Please try again.";
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const getSelectedService = () => {
    return services.find((s) => s.id === formData.service);
  };

  const getTotalPrice = () => {
    const service = getSelectedService();
    if (!service) return 0;

    let total = service.price;
    if (formData.urgency === "urgent") {
      total += 25; // Urgent fee
    }
    return total;
  };

  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const minDate = new Date().toISOString().split("T")[0];
  const maxDate = new Date(Date.now() + 90 * 24 * 60 * 60 * 1000)
    .toISOString()
    .split("T")[0];

  return (
    <DashboardLayout title="Book a Service">
      <div className="book-service-container">
        <div className="book-service-header">
          <h1>Book a Service</h1>
          <p>Schedule a professional service at your convenience</p>
          {technician && (
            <div className="selected-technician-banner">
              <i className="fas fa-user-check"></i>
              <span>
                Booking with{" "}
                <strong>
                  {technician.firstName} {technician.lastName}
                </strong>
                {technician.technicianDetails?.rating && (
                  <> - ⭐ {technician.technicianDetails.rating.toFixed(1)}</>
                )}
              </span>
            </div>
          )}
        </div>

        <div className="progress-steps">
          <div className="progress-line">
            <div
              className="progress-line-fill"
              style={{ width: `${((step - 1) / 2) * 100}%` }}
            ></div>
          </div>
          {[
            { number: 1, title: "Service & Time", icon: "fas fa-calendar" },
            { number: 2, title: "Location", icon: "fas fa-map-marker-alt" },
            { number: 3, title: "Confirm", icon: "fas fa-check-circle" },
          ].map((s) => (
            <div
              key={s.number}
              className={`step-item ${step >= s.number ? "active" : ""} ${step > s.number ? "completed" : ""}`}
            >
              <div
                className={`step-circle ${step >= s.number ? "active" : ""} ${step > s.number ? "completed" : ""}`}
              >
                <i className={s.icon}></i>
              </div>
              <span className="step-title">{s.title}</span>
            </div>
          ))}
        </div>

        <form onSubmit={handleSubmit}>
          {step === 1 && (
            <div className="booking-card">
              <div className="booking-card-header">
                <h2>Select Service & Schedule</h2>
                <p>Choose the service you need and pick a convenient time</p>
              </div>

              <div className="form-group">
                <label className="form-label form-label-required">
                  Choose Service
                </label>
                <div className="services-grid">
                  {services.map((service) => (
                    <div
                      key={service.id}
                      onClick={() => {
                        setFormData((prev) => ({
                          ...prev,
                          service: service.id,
                          serviceType: service.id,
                        }));
                        setErrors((prev) => ({ ...prev, service: "" }));
                      }}
                      className={`service-card ${formData.service === service.id ? "selected" : ""}`}
                    >
                      <i className={`${service.icon} service-icon`}></i>
                      <div className="service-name">{service.name}</div>
                      <div className="service-price">
                        Starting at ${service.price}
                      </div>
                    </div>
                  ))}
                </div>
                {errors.service && (
                  <span className="form-error">{errors.service}</span>
                )}
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label
                    className="form-label form-label-required"
                    htmlFor="date"
                  >
                    Date
                  </label>
                  <input
                    type="date"
                    id="date"
                    name="date"
                    className="form-input"
                    value={formData.date}
                    onChange={handleInputChange}
                    min={minDate}
                    max={maxDate}
                  />
                  {errors.date && (
                    <span className="form-error">{errors.date}</span>
                  )}
                </div>

                <div className="form-group">
                  <label className="form-label form-label-required">
                    Time Slot
                  </label>
                  <select
                    name="time"
                    className="form-select"
                    value={formData.time}
                    onChange={handleInputChange}
                  >
                    <option value="">Select time</option>
                    {timeSlots.map((slot) => (
                      <option key={slot} value={slot}>
                        {slot}
                      </option>
                    ))}
                  </select>
                  {errors.time && (
                    <span className="form-error">{errors.time}</span>
                  )}
                </div>
              </div>

              <div className="form-group">
                <label
                  className="form-label form-label-required"
                  htmlFor="description"
                >
                  Describe the Issue
                </label>
                <textarea
                  id="description"
                  name="description"
                  className="form-input"
                  rows="4"
                  placeholder="Please describe what needs to be fixed or the service you need..."
                  value={formData.description}
                  onChange={handleInputChange}
                />
                {errors.description && (
                  <span className="form-error">{errors.description}</span>
                )}
              </div>

              <div className="form-group">
                <label className="form-label">Urgency</label>
                <select
                  name="urgency"
                  className="form-select"
                  value={formData.urgency}
                  onChange={handleInputChange}
                >
                  <option value="normal">Normal (+$0)</option>
                  <option value="urgent">Urgent (+$25)</option>
                </select>
              </div>

              <div className="form-actions">
                <Link to="/dashboard" className="btn-back">
                  <i className="fas fa-times"></i> Cancel
                </Link>
                <button type="button" onClick={handleNext} className="btn-next">
                  Next Step <i className="fas fa-arrow-right"></i>
                </button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="booking-card">
              <div className="booking-card-header">
                <h2>Service Location</h2>
                <p>Where should the technician come?</p>
              </div>

              <div className="form-group">
                <label
                  className="form-label form-label-required"
                  htmlFor="address"
                >
                  Street Address
                </label>
                <input
                  type="text"
                  id="address"
                  name="address"
                  className="form-input"
                  placeholder="123 Main Street"
                  value={formData.address}
                  onChange={handleInputChange}
                />
                {errors.address && (
                  <span className="form-error">{errors.address}</span>
                )}
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label
                    className="form-label form-label-required"
                    htmlFor="city"
                  >
                    City
                  </label>
                  <input
                    type="text"
                    id="city"
                    name="city"
                    className="form-input"
                    placeholder="City"
                    value={formData.city}
                    onChange={handleInputChange}
                  />
                  {errors.city && (
                    <span className="form-error">{errors.city}</span>
                  )}
                </div>

                <div className="form-group">
                  <label
                    className="form-label form-label-required"
                    htmlFor="state"
                  >
                    State
                  </label>
                  <input
                    type="text"
                    id="state"
                    name="state"
                    className="form-input"
                    placeholder="State"
                    value={formData.state}
                    onChange={handleInputChange}
                  />
                  {errors.state && (
                    <span className="form-error">{errors.state}</span>
                  )}
                </div>

                <div className="form-group">
                  <label
                    className="form-label form-label-required"
                    htmlFor="zipCode"
                  >
                    ZIP Code
                  </label>
                  <input
                    type="text"
                    id="zipCode"
                    name="zipCode"
                    className="form-input"
                    placeholder="12345"
                    value={formData.zipCode}
                    onChange={handleInputChange}
                  />
                  {errors.zipCode && (
                    <span className="form-error">{errors.zipCode}</span>
                  )}
                </div>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="notes">
                  Additional Notes (Optional)
                </label>
                <textarea
                  id="notes"
                  name="notes"
                  className="form-input"
                  rows="3"
                  placeholder="Any special instructions, access codes, parking information, etc."
                  value={formData.notes}
                  onChange={handleInputChange}
                />
              </div>

              <div className="form-actions">
                <button type="button" onClick={handleBack} className="btn-back">
                  <i className="fas fa-arrow-left"></i> Back
                </button>
                <button type="button" onClick={handleNext} className="btn-next">
                  Review <i className="fas fa-arrow-right"></i>
                </button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="booking-card">
              <div className="booking-card-header">
                <h2>Confirm Your Booking</h2>
                <p>Please review your booking details</p>
              </div>

              <div className="booking-summary">
                <div className="summary-section">
                  <h3>
                    <i className="fas fa-tools"></i> Service Details
                  </h3>
                  <div className="summary-item">
                    <span className="label">Service:</span>
                    <span className="value">{getSelectedService()?.name}</span>
                  </div>
                  <div className="summary-item">
                    <span className="label">Date:</span>
                    <span className="value">{formatDate(formData.date)}</span>
                  </div>
                  <div className="summary-item">
                    <span className="label">Time:</span>
                    <span className="value">{formData.time}</span>
                  </div>
                  <div className="summary-item">
                    <span className="label">Description:</span>
                    <span className="value">{formData.description}</span>
                  </div>
                  <div className="summary-item">
                    <span className="label">Urgency:</span>
                    <span className="value">
                      {formData.urgency === "urgent" ? "Urgent" : "Normal"}
                    </span>
                  </div>
                </div>

                {technician && (
                  <div className="summary-section">
                    <h3>
                      <i className="fas fa-user-check"></i> Technician
                    </h3>
                    <div className="summary-item">
                      <span className="label">Name:</span>
                      <span className="value">
                        {technician.firstName} {technician.lastName}
                      </span>
                    </div>
                    {technician.technicianDetails?.rating && (
                      <div className="summary-item">
                        <span className="label">Rating:</span>
                        <span className="value">
                          ⭐ {technician.technicianDetails.rating.toFixed(1)}
                        </span>
                      </div>
                    )}
                  </div>
                )}

                <div className="summary-section">
                  <h3>
                    <i className="fas fa-map-marker-alt"></i> Location
                  </h3>
                  <div className="summary-item">
                    <span className="label">Address:</span>
                    <span className="value">
                      {formData.address}, {formData.city}, {formData.state}{" "}
                      {formData.zipCode}
                    </span>
                  </div>
                  {formData.notes && (
                    <div className="summary-item">
                      <span className="label">Notes:</span>
                      <span className="value">{formData.notes}</span>
                    </div>
                  )}
                </div>

                <div className="summary-section pricing-section">
                  <h3>
                    <i className="fas fa-dollar-sign"></i> Pricing
                  </h3>
                  <div className="summary-item">
                    <span className="label">Base Price:</span>
                    <span className="value">
                      ${getSelectedService()?.price}
                    </span>
                  </div>
                  {formData.urgency === "urgent" && (
                    <div className="summary-item">
                      <span className="label">Urgent Fee:</span>
                      <span className="value">$25</span>
                    </div>
                  )}
                  <div className="summary-item total">
                    <span className="label">Total:</span>
                    <span className="value">${getTotalPrice()}</span>
                  </div>
                </div>
              </div>

              <div className="form-actions">
                <button type="button" onClick={handleBack} className="btn-back">
                  <i className="fas fa-arrow-left"></i> Back
                </button>
                <button
                  type="submit"
                  className="btn-primary"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <i className="fas fa-spinner fa-spin"></i> Booking...
                    </>
                  ) : (
                    <>
                      <i className="fas fa-check"></i> Confirm Booking
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </form>
      </div>
    </DashboardLayout>
  );
};

export default BookService;
