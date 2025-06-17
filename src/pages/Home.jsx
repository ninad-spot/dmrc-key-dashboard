import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/Auth/AuthContext';
import { useNavigate } from 'react-router-dom';
import { deviceApi } from '../common/Api';
import Swal from 'sweetalert2';

const Home = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [deviceKeys, setDeviceKeys] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [newKey, setNewKey] = useState('');
  const [newKeyType, setNewKeyType] = useState('App1');
  const [newKeyIV, setNewKeyIV] = useState('');
  const [editingKey, setEditingKey] = useState(null);
  const [editKey, setEditKey] = useState('');
  const [editKeyType, setEditKeyType] = useState('App1');
  const [editKeyIV, setEditKeyIV] = useState('');

  // Key types available
  const keyTypes = ['App1', 'App2', 'qr_mo', 'qr_pp'];

  // Helper function to check if IV is required for the key type
  const isIVRequired = (type) => {
    return type === 'qr_mo' || type === 'qr_pp';
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Fetch device keys
  const fetchDeviceKeys = async () => {
    setLoading(true);
    try {
      const response = await deviceApi.get('/device-key');
      setDeviceKeys(response.data.data || []);
    } catch (error) {
      console.error('Error fetching device keys:', error);
      Swal.fire({
        title: 'Error',
        text: 'Failed to fetch device keys',
        icon: 'error',
        confirmButtonText: 'Okay',
      });
    } finally {
      setLoading(false);
    }
  };

  // Add new device key
  const handleAddKey = async () => {
    if (!newKey.trim()) {
      Swal.fire({
        title: 'Error',
        text: 'Please enter a device key',
        icon: 'error',
        confirmButtonText: 'Okay',
      });
      return;
    }

    // Check if IV is required and validate
    if (isIVRequired(newKeyType) && !newKeyIV.trim()) {
      Swal.fire({
        title: 'Error',
        text: 'Please enter an IV for this key type',
        icon: 'error',
        confirmButtonText: 'Okay',
      });
      return;
    }

    try {
      const payload = {
        key: newKey,
        type: newKeyType
      };

      // Add IV if required
      if (isIVRequired(newKeyType)) {
        payload.iv = newKeyIV;
      }

      await deviceApi.post('/device-key', payload);
      setNewKey('');
      setNewKeyType('App1');
      setNewKeyIV('');
      setShowAddModal(false);
      fetchDeviceKeys();
      Swal.fire({
        title: 'Success',
        text: 'Device key added successfully',
        icon: 'success',
        confirmButtonText: 'Okay',
      });
    } catch (error) {
      console.error('Error adding device key:', error);
      Swal.fire({
        title: 'Error',
        text: 'Failed to add device key',
        icon: 'error',
        confirmButtonText: 'Okay',
      });
    }
  };

  // Update device key
  const handleUpdateKey = async () => {
    if (!editKey.trim()) {
      Swal.fire({
        title: 'Error',
        text: 'Please enter a device key',
        icon: 'error',
        confirmButtonText: 'Okay',
      });
      return;
    }

    // Check if IV is required and validate
    if (isIVRequired(editKeyType) && !editKeyIV.trim()) {
      Swal.fire({
        title: 'Error',
        text: 'Please enter an IV for this key type',
        icon: 'error',
        confirmButtonText: 'Okay',
      });
      return;
    }

    try {
      const payload = {
        key: editKey,
        type: editKeyType
      };

      // Add IV if required, or set to null if type changed from IV to non-IV
      if (isIVRequired(editKeyType)) {
        payload.iv = editKeyIV;
      } else {
        // Send null if changing from IV type to non-IV type
        payload.iv = null;
      }

      await deviceApi.put(`/device-key/${editingKey.id}`, payload);
      setEditKey('');
      setEditKeyType('App1');
      setEditKeyIV('');
      setEditingKey(null);
      setShowEditModal(false);
      fetchDeviceKeys();
      Swal.fire({
        title: 'Success',
        text: 'Device key updated successfully',
        icon: 'success',
        confirmButtonText: 'Okay',
      });
    } catch (error) {
      console.error('Error updating device key:', error);
      Swal.fire({
        title: 'Error',
        text: 'Failed to update device key',
        icon: 'error',
        confirmButtonText: 'Okay',
      });
    }
  };

  // Delete device key
  const handleDeleteKey = async (id) => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: 'You will not be able to recover this device key!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, delete it!',
    });

    if (result.isConfirmed) {
      try {
        await deviceApi.delete(`/device-key/${id}`);
        fetchDeviceKeys();
        Swal.fire({
          title: 'Deleted!',
          text: 'Device key has been deleted.',
          icon: 'success',
          confirmButtonText: 'Okay',
        });
      } catch (error) {
        console.error('Error deleting device key:', error);
        Swal.fire({
          title: 'Error',
          text: 'Failed to delete device key',
          icon: 'error',
          confirmButtonText: 'Okay',
        });
      }
    }
  };

  // Open edit modal
  const openEditModal = (deviceKey) => {
    setEditingKey(deviceKey);
    setEditKey(deviceKey.key);
    setEditKeyType(deviceKey.type || 'App1');
    setEditKeyIV(deviceKey.iv || '');
    setShowEditModal(true);
  };

  // Load device keys on component mount
  useEffect(() => {
    fetchDeviceKeys();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="w-full px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-900">DMRC HHT DASHBOARD</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-gray-700">
                Welcome, {user?.first_name} {user?.last_name}
              </span>
              <button
                onClick={handleLogout}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm font-medium"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="w-full py-6 px-4 sm:px-6 lg:px-8">
        <div className="w-full">
          {/* Device Keys Management */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900">
                  Device Keys Management
                </h3>
                <button
                  onClick={() => setShowAddModal(true)}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium"
                >
                  Add New Key
                </button>
              </div>

              {/* Loading State */}
              {loading ? (
                <div className="flex justify-center items-center py-8">
                  <div className="text-lg text-gray-600">Loading device keys...</div>
                </div>
              ) : (
                /* Device Keys Table */
                <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
                  <table className="min-w-full divide-y divide-gray-300">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          ID
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Device Key
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Type
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          IV
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Created At
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {deviceKeys.length === 0 ? (
                        <tr>
                          <td colSpan="6" className="px-6 py-4 text-center text-gray-500">
                            No device keys found
                          </td>
                        </tr>
                      ) : (
                        deviceKeys.map((deviceKey) => (
                          <tr key={deviceKey.id}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {deviceKey.id}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {deviceKey.key}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                {deviceKey.type || 'N/A'}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {deviceKey.iv ? (
                                <span className="font-mono text-xs bg-gray-100 px-2 py-1 rounded">
                                  {deviceKey.iv}
                                </span>
                              ) : (
                                <span className="text-gray-400">-</span>
                              )}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {new Date(deviceKey.created_at).toLocaleDateString()}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                              <button
                                onClick={() => openEditModal(deviceKey)}
                                className="text-indigo-600 hover:text-indigo-900"
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => handleDeleteKey(deviceKey.id)}
                                className="text-red-600 hover:text-red-900"
                              >
                                Delete
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Add Key Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Add New Device Key</h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Device Key
                  </label>
                  <input
                    type="text"
                    value={newKey}
                    onChange={(e) => setNewKey(e.target.value)}
                    placeholder="Enter device key"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                {/* Conditional IV field */}
                {isIVRequired(newKeyType) && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      IV (Initialization Vector) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={newKeyIV}
                      onChange={(e) => setNewKeyIV(e.target.value)}
                      placeholder="Enter IV"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Key Type
                  </label>
                  <select
                    value={newKeyType}
                    onChange={(e) => setNewKeyType(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    {keyTypes.map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => {
                    setShowAddModal(false);
                    setNewKey('');
                    setNewKeyType('App1');
                    setNewKeyIV('');
                  }}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddKey}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Add Key
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Key Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Edit Device Key</h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Device Key
                  </label>
                  <input
                    type="text"
                    value={editKey}
                    onChange={(e) => setEditKey(e.target.value)}
                    placeholder="Enter device key"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                {/* Conditional IV field */}
                {isIVRequired(editKeyType) && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      IV (Initialization Vector) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={editKeyIV}
                      onChange={(e) => setEditKeyIV(e.target.value)}
                      placeholder="Enter IV"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Key Type
                  </label>
                  <select
                    value={editKeyType}
                    onChange={(e) => setEditKeyType(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    {keyTypes.map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => {
                    setShowEditModal(false);
                    setEditKey('');
                    setEditKeyType('App1');
                    setEditKeyIV('');
                    setEditingKey(null);
                  }}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
                >
                  Cancel
                </button>
                <button
                  onClick={handleUpdateKey}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Update Key
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Home;
