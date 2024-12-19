import React, { useState, useEffect } from "react";
import Modal from "@mui/material/Modal";
import CloseIcon from "@mui/icons-material/Close";
import { useSelector } from "react-redux";
import Loading from "../../../../components/Loading/Loading";
import {
  acceptRegisterSellerAPI,
  getAllRegisterSellerAPI,
} from "../../../../api/userAPI";

const RegisterList = () => {
  const user = JSON.parse(localStorage.getItem("user"));
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);

  const [registrations, setRegistrations] = useState([]);
  const [selectedRegistration, setSelectedRegistration] = useState(null);

  const fetchRegistrationList = async () => {
    setLoading(true);
    try {
      const response = await getAllRegisterSellerAPI(user.access_token);
      setRegistrations(response.data);
    } catch (error) {
      console.error("Error fetching seller registrations:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRegistrationList();
  }, [user.access_token]);

  const handleAcceptRegistration = async (id) => {
    setLoading(true);
    try {
      const formData = { id: id };
      const response = await acceptRegisterSellerAPI(
        formData,
        user.access_token
      );
      console.log(response.data);
      setShowModal(false);
      // Refresh the registration list after approval
      await fetchRegistrationList();
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  const handleShowDetails = (registration) => {
    setSelectedRegistration(registration);
    setShowModal(true);
  };

  const handleRejectRegistration = () => {
    // Define the rejection logic here
  };

  return (
    <div className="p-6">
      {loading && <Loading />}
      <h2 className="text-2xl font-semibold mb-4">Seller Registration List</h2>

      {/* Registration Table */}
      <table className="min-w-full bg-white border border-gray-300 rounded-lg shadow-sm">
        <thead>
          <tr className="bg-gray-100 text-left">
            <th className="p-4 border-b">Register ID</th>
            <th className="p-4 border-b">Seller Name</th>
            <th className="p-4 border-b">Address</th>
            <th className="p-4 border-b">Phone</th>
            <th className="p-4 border-b">Email</th>
            {/* <th className="p-4 border-b">Registration Date</th> */}
            {/* <th className="p-4 border-b">Status</th> */}
          </tr>
        </thead>
        <tbody>
          {registrations.map((registration) => (
            <tr key={registration.id} className="hover:bg-gray-50">
              <td
                className="p-4 border-b cursor-pointer"
                onClick={() => handleShowDetails(registration)}
              >
                {registration._id}
              </td>
              <td
                className="p-4 border-b truncate max-w-xs cursor-pointer"
                onClick={() => handleShowDetails(registration)}
              >
                {registration.name}
              </td>
              <td className="p-4 border-b truncate max-w-xs">
                {registration.address}
              </td>
              <td className="p-4 border-b">{registration.number}</td>
              <td className="p-4 border-b">{registration.userName}</td>
              {/* <td className="p-4 border-b">{registration.registrationDate}</td> */}
              {/* <td className={`p-4 border-b ${registration.statusColor}`}>
                {registration.status}
              </td> */}
            </tr>
          ))}
        </tbody>
      </table>

      {/* Modal for Registration Details */}
      {showModal && selectedRegistration && (
        <Modal
          open={showModal}
          onClose={() => setShowModal(false)}
          aria-labelledby="registration-details-modal"
          aria-describedby="registration-details-description"
        >
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <div className="p-6 bg-white rounded-lg shadow-xl max-w-2xl w-full relative">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-2xl font-bold text-gray-800">
                  Seller Registration Details
                </h3>
                <CloseIcon
                  className="text-gray-500 cursor-pointer"
                  onClick={() => setShowModal(false)}
                  size={24}
                />
              </div>

              {/* Two-column Layout */}
              <div className="grid grid-cols-2 gap-6">
                {/* Left Column: Registration Information */}
                <div>
                  <div className="mb-4">
                    <strong className="text-sm text-gray-600">
                      Seller Name:
                    </strong>
                    <p className="text-gray-800">
                      {selectedRegistration?.name}
                    </p>
                  </div>
                  <div className="mb-4">
                    <strong className="text-sm text-gray-600">Phone:</strong>
                    <p className="text-gray-800">
                      {selectedRegistration?.number}
                    </p>
                  </div>
                  <div className="mb-4">
                    <strong className="text-sm text-gray-600">Address:</strong>
                    <p className="text-gray-800">
                      {selectedRegistration?.address}
                    </p>
                  </div>
                  <div className="mb-4">
                    <strong className="text-sm text-gray-600">Email:</strong>
                    <p className="text-gray-800">
                      {selectedRegistration?.userName}
                    </p>
                  </div>
                </div>

                {/* Right Column: Image */}
                <div className="flex justify-center items-center">
                  <img
                    src={selectedRegistration?.avata}
                    alt="Seller Profile"
                    className="w-100 h-100 object-cover rounded-lg shadow"
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-6 flex justify-end space-x-4">
                <button
                  onClick={() =>
                    handleAcceptRegistration(selectedRegistration?._id)
                  }
                  className="bg-green-500 text-white py-2 px-6 rounded-lg hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-300"
                >
                  Approve
                </button>
                <button
                  onClick={handleRejectRegistration}
                  className="bg-red-500 text-white py-2 px-6 rounded-lg hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-300"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default RegisterList;
