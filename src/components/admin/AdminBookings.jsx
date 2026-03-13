import { useState, useEffect } from 'react';
import * as bookingApi from '../../api/bookingApi';
import { getDemoRequests, updateDemoRequest, deleteDemoRequest } from '../../api/demoRequestApi';
import './AdminBookings.css';

export default function AdminBookings() {
    const [bookings, setBookings] = useState([]);
    const [filteredBookings, setFilteredBookings] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [selectedBookings, setSelectedBookings] = useState([]);
    const [activeView, setActiveView] = useState('bookings');
    const [demoRequests, setDemoRequests] = useState([]);

    const loadBookings = async () => {
        const data = await bookingApi.getBookings();
        setBookings(data);
    };

    const loadDemoRequests = async () => {
        const data = await getDemoRequests();
        setDemoRequests(data || []);
    };

    const filterBookings = () => {
        let filtered = [...bookings];

        if (searchTerm) {
            filtered = filtered.filter(b =>
                b.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                b.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                b.phone.includes(searchTerm)
            );
        }

        if (statusFilter !== 'all') {
            filtered = filtered.filter(b => (b.status || 'pending') === statusFilter);
        }

        setFilteredBookings(filtered);
    };

    useEffect(() => {
        loadBookings();
        loadDemoRequests();
    }, []); 

    useEffect(() => {
        filterBookings();
    }, [bookings, searchTerm, statusFilter]);

    const handleDemoStatusChange = async (id, newStatus) => {
        await updateDemoRequest(id, { status: newStatus });
        setDemoRequests(prev => prev.map(d => d.id === id ? { ...d, status: newStatus } : d));
    };

    const handleDeleteDemo = async (id) => {
        if (confirm('Are you sure you want to delete this demo request?')) {
            await deleteDemoRequest(id);
            setDemoRequests(prev => prev.filter(d => d.id !== id));
        }
    };

    const updateBookingStatus = async (id, newStatus) => {
        await bookingApi.updateBookingStatus(id, newStatus);
        setBookings(prev => prev.map(b => b.id === id ? { ...b, status: newStatus } : b));
    };

    const deleteBooking = async (id) => {
        if (confirm('Are you sure you want to delete this booking?')) {
            await bookingApi.deleteBooking(id);
            setBookings(prev => prev.filter(b => b.id !== id));
        }
    };

    const handleBulkAction = async (action) => {
        if (selectedBookings.length === 0) {
            alert('Please select bookings first');
            return;
        }
        await bookingApi.bulkUpdateBookingStatus(selectedBookings, action);
        setBookings(prev => prev.map(b =>
            selectedBookings.includes(b.id) ? { ...b, status: action } : b
        ));
        setSelectedBookings([]);
    };

    const toggleSelectBooking = (id) => {
        setSelectedBookings(prev =>
            prev.includes(id) ? prev.filter(bid => bid !== id) : [...prev, id]
        );
    };

    const exportCSV = () => {
        const csv = [
            ['ID', 'Name', 'Email', 'Phone', 'Date', 'Time', 'Status', 'Message', 'Timestamp'],
            ...filteredBookings.map(b => [
                b.id,
                b.name,
                b.email,
                b.phone,
                b.preferred_date || b.preferredDate,
                b.preferred_time || b.preferredTime,
                b.status || 'pending',
                b.message || '',
                new Date(b.created_at || b.timestamp).toLocaleString()
            ])
        ].map(row => row.join(',')).join('\n');

        const blob = new Blob([csv], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `bookings-${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
    };

    return (
        <div className="admin-bookings">
            <div className="bookings-header">
                <h2>Bookings Management</h2>
                <button onClick={exportCSV} className="btn btn-primary">
                    Export CSV
                </button>
            </div>

            <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
                <button onClick={() => setActiveView('bookings')}
                    className={`btn ${activeView === 'bookings' ? 'btn-primary' : 'btn-secondary'}`}>
                    Bookings ({bookings.length})
                </button>
                <button onClick={() => setActiveView('demo')}
                    className={`btn ${activeView === 'demo' ? 'btn-primary' : 'btn-secondary'}`}>
                    Demo Requests ({demoRequests.length})
                </button>
            </div>

            {activeView === 'demo' ? (
                <div className="glass-card bookings-table-card">
                    {demoRequests.length === 0 ? (
                        <div className="empty-state"><p>No demo requests yet</p></div>
                    ) : (
                        <div className="table-responsive">
                            <table className="bookings-table">
                                <thead>
                                    <tr>
                                        <th>Name</th>
                                        <th>Phone</th>
                                        <th>Email</th>
                                        <th>Level</th>
                                        <th>Age</th>
                                        <th>Time Slot</th>
                                        <th>Status</th>
                                        <th>Date</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {demoRequests.map((req) => (
                                        <tr key={req.id}>
                                            <td>{req.name}</td>
                                            <td>{req.phone}</td>
                                            <td>{req.email}</td>
                                            <td>{req.level}</td>
                                            <td>{req.age}</td>
                                            <td>{req.time_slot}</td>
                                            <td>
                                                <select
                                                    value={req.status || 'pending'}
                                                    onChange={(e) => handleDemoStatusChange(req.id, e.target.value)}
                                                    className={`status-select ${req.status || 'pending'}`}
                                                >
                                                    <option value="pending">Pending</option>
                                                    <option value="contacted">Contacted</option>
                                                    <option value="scheduled">Scheduled</option>
                                                    <option value="completed">Completed</option>
                                                    <option value="cancelled">Cancelled</option>
                                                </select>
                                            </td>
                                            <td>{req.created_at ? new Date(req.created_at).toLocaleDateString() : ''}</td>
                                            <td>
                                                <div className="action-buttons">
                                                    {req.phone && (
                                                        <a href={`https://wa.me/${req.phone.replace(/[^0-9]/g, '')}`}
                                                            target="_blank" rel="noopener noreferrer"
                                                            className="action-btn whatsapp" title="WhatsApp">💬</a>
                                                    )}
                                                    <button onClick={() => handleDeleteDemo(req.id)}
                                                        className="action-btn delete" title="Delete">🗑️</button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            ) : (
            <>
            {/* Filters */}
            <div className="glass-card filters-card">
                <div className="filters-row">
                    <input
                        type="text"
                        placeholder="Search by name, email, or phone..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="search-input"
                    />

                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="status-filter"
                    >
                        <option value="all">All Status</option>
                        <option value="pending">Pending</option>
                        <option value="confirmed">Confirmed</option>
                        <option value="cancelled">Cancelled</option>
                    </select>

                    {selectedBookings.length > 0 && (
                        <div className="bulk-actions">
                            <button onClick={() => handleBulkAction('confirmed')} className="btn btn-secondary">
                                Confirm Selected
                            </button>
                            <button onClick={() => handleBulkAction('cancelled')} className="btn btn-secondary">
                                Cancel Selected
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* Bookings Table */}
            <div className="glass-card bookings-table-card">
                {filteredBookings.length === 0 ? (
                    <div className="empty-state">
                        <p>No bookings found</p>
                    </div>
                ) : (
                    <div className="table-responsive">
                        <table className="bookings-table">
                            <thead>
                                <tr>
                                    <th>
                                        <input
                                            type="checkbox"
                                            onChange={(e) => {
                                                if (e.target.checked) {
                                                    setSelectedBookings(filteredBookings.map(b => b.id));
                                                } else {
                                                    setSelectedBookings([]);
                                                }
                                            }}
                                        />
                                    </th>
                                    <th>Name</th>
                                    <th>Email</th>
                                    <th>Phone</th>
                                    <th>Preferred Date</th>
                                    <th>Time</th>
                                    <th>Status</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredBookings.map((booking) => (
                                    <tr key={booking.id}>
                                        <td>
                                            <input
                                                type="checkbox"
                                                checked={selectedBookings.includes(booking.id)}
                                                onChange={() => toggleSelectBooking(booking.id)}
                                            />
                                        </td>
                                        <td>{booking.name}</td>
                                        <td>{booking.email}</td>
                                        <td>{booking.phone}</td>
                                        <td>{new Date(booking.preferred_date || booking.preferredDate).toLocaleDateString()}</td>
                                        <td>{booking.preferred_time || booking.preferredTime}</td>
                                        <td>
                                            <select
                                                value={booking.status || 'pending'}
                                                onChange={(e) => updateBookingStatus(booking.id, e.target.value)}
                                                className={`status-select ${booking.status || 'pending'}`}
                                            >
                                                <option value="pending">Pending</option>
                                                <option value="confirmed">Confirmed</option>
                                                <option value="cancelled">Cancelled</option>
                                            </select>
                                        </td>
                                        <td>
                                            <div className="action-buttons">
                                                <a
                                                    href={`https://wa.me/${booking.phone.replace(/[^0-9]/g, '')}`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="action-btn whatsapp"
                                                    title="WhatsApp"
                                                >
                                                    💬
                                                </a>
                                                <button
                                                    onClick={() => deleteBooking(booking.id)}
                                                    className="action-btn delete"
                                                    title="Delete"
                                                >
                                                    🗑️
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
            </>
            )}
        </div>
    );
}
