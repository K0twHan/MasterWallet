import { useState, useEffect } from 'react';
import { Plus, Trash2, Copy, Edit2, Check, X, User } from 'lucide-react';

interface SavedAddress {
  id: string;
  name: string;
  address: string;
  createdAt: number;
}

interface AddressBookProps {
  onSelectAddress?: (address: string) => void;
}

export default function AddressBook({ onSelectAddress }: AddressBookProps) {
  const [addresses, setAddresses] = useState<SavedAddress[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newName, setNewName] = useState('');
  const [newAddress, setNewAddress] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  // Load addresses from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('wdk-address-book');
    if (saved) {
      try {
        setAddresses(JSON.parse(saved));
      } catch (e) {
        console.error('Failed to load address book:', e);
      }
    }
  }, []);

  // Save addresses to localStorage whenever they change
  useEffect(() => {
    if (addresses.length > 0) {
      localStorage.setItem('wdk-address-book', JSON.stringify(addresses));
    }
  }, [addresses]);

  const handleAddAddress = () => {
    if (!newName.trim() || !newAddress.trim()) {
      alert('Please enter name and address');
      return;
    }

    // Basic Ethereum address validation
    if (!newAddress.match(/^0x[a-fA-F0-9]{40}$/)) {
      alert('Invalid Ethereum address');
      return;
    }

    // Check if address already exists
    if (addresses.some(addr => addr.address.toLowerCase() === newAddress.toLowerCase())) {
      alert('This address is already saved');
      return;
    }

    const newSavedAddress: SavedAddress = {
      id: Date.now().toString(),
      name: newName.trim(),
      address: newAddress.trim(),
      createdAt: Date.now()
    };

    setAddresses([...addresses, newSavedAddress]);
    setNewName('');
    setNewAddress('');
    setShowAddModal(false);
  };

  const handleDeleteAddress = (id: string) => {
    if (confirm('Are you sure you want to delete this address?')) {
      setAddresses(addresses.filter(addr => addr.id !== id));
    }
  };

  const handleEditName = (id: string) => {
    if (!editName.trim()) {
      alert('Please enter a valid name');
      return;
    }

    setAddresses(addresses.map(addr => 
      addr.id === id ? { ...addr, name: editName.trim() } : addr
    ));
    setEditingId(null);
    setEditName('');
  };

  const handleCopyAddress = (address: string) => {
    navigator.clipboard.writeText(address);
    alert('Address copied!');
  };

  const filteredAddresses = addresses.filter(addr =>
    addr.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    addr.address.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  return (
    <div style={{
      background: 'rgba(20, 20, 35, 0.98)',
      border: '1px solid rgba(255, 255, 255, 0.1)',
      borderRadius: '16px',
      padding: '20px',
      minWidth: '400px',
      maxWidth: '500px'
    }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '20px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <User size={20} color="#FF6B00" />
          <h3 style={{
            margin: 0,
            fontSize: '18px',
            fontWeight: '700',
            color: '#fff',
            fontFamily: "'Space Grotesk', sans-serif"
          }}>
            Address Book
          </h3>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          style={{
            background: '#FF6B00',
            border: 'none',
            padding: '8px 16px',
            borderRadius: '8px',
            color: '#fff',
            fontSize: '13px',
            fontWeight: '600',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            transition: 'all 0.2s',
            fontFamily: "'Space Grotesk', sans-serif"
          }}
          onMouseOver={(e) => e.currentTarget.style.background = '#FF8533'}
          onMouseOut={(e) => e.currentTarget.style.background = '#FF6B00'}
        >
          <Plus size={16} />
          Add New
        </button>
      </div>

      {/* Search */}
      <input
        type="text"
        placeholder="Search by name or address..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        style={{
          width: '100%',
          background: 'rgba(0, 0, 0, 0.3)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          borderRadius: '10px',
          padding: '10px 14px',
          color: '#fff',
          fontSize: '14px',
          marginBottom: '16px',
          fontFamily: "'DM Sans', sans-serif",
          boxSizing: 'border-box'
        }}
      />

      {/* Address List */}
      <div style={{
        maxHeight: '400px',
        overflowY: 'auto',
        marginBottom: showAddModal ? '16px' : '0'
      }}>
        {filteredAddresses.length === 0 ? (
          <div style={{
            textAlign: 'center',
            padding: '40px 20px',
            color: '#666'
          }}>
            <User size={48} color="#333" style={{ marginBottom: '12px' }} />
            <p style={{ margin: 0, fontSize: '14px' }}>
              {searchQuery ? 'No address found' : 'No saved addresses yet'}
            </p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {filteredAddresses.map((addr) => (
              <div
                key={addr.id}
                style={{
                  background: 'rgba(0, 0, 0, 0.3)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '12px',
                  padding: '14px',
                  transition: 'all 0.2s'
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.background = 'rgba(255, 107, 0, 0.05)';
                  e.currentTarget.style.borderColor = 'rgba(255, 107, 0, 0.3)';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.background = 'rgba(0, 0, 0, 0.3)';
                  e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)';
                }}
              >
                {/* Name */}
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '8px'
                }}>
                  {editingId === addr.id ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1 }}>
                      <input
                        type="text"
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        autoFocus
                        style={{
                          flex: 1,
                          background: 'rgba(0, 0, 0, 0.5)',
                          border: '1px solid rgba(255, 107, 0, 0.5)',
                          borderRadius: '6px',
                          padding: '6px 10px',
                          color: '#fff',
                          fontSize: '14px',
                          fontFamily: "'Space Grotesk', sans-serif",
                          fontWeight: '600'
                        }}
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') handleEditName(addr.id);
                        }}
                      />
                      <button
                        onClick={() => handleEditName(addr.id)}
                        style={{
                          background: '#00E676',
                          border: 'none',
                          padding: '6px',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center'
                        }}
                      >
                        <Check size={14} color="#000" />
                      </button>
                      <button
                        onClick={() => {
                          setEditingId(null);
                          setEditName('');
                        }}
                        style={{
                          background: 'rgba(255, 255, 255, 0.1)',
                          border: 'none',
                          padding: '6px',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center'
                        }}
                      >
                        <X size={14} color="#fff" />
                      </button>
                    </div>
                  ) : (
                    <>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{
                          width: '32px',
                          height: '32px',
                          background: 'linear-gradient(135deg, #FF6B00 0%, #FF8533 100%)',
                          borderRadius: '50%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '14px',
                          fontWeight: '700',
                          color: '#fff'
                        }}>
                          {addr.name.charAt(0).toUpperCase()}
                        </div>
                        <span style={{
                          fontSize: '15px',
                          fontWeight: '600',
                          color: '#fff',
                          fontFamily: "'Space Grotesk', sans-serif"
                        }}>
                          {addr.name}
                        </span>
                      </div>
                      <div style={{ display: 'flex', gap: '4px' }}>
                        <button
                          onClick={() => {
                            setEditingId(addr.id);
                            setEditName(addr.name);
                          }}
                          style={{
                            background: 'transparent',
                            border: 'none',
                            padding: '6px',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            transition: 'all 0.2s'
                          }}
                          onMouseOver={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)'}
                          onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}
                        >
                          <Edit2 size={14} color="#999" />
                        </button>
                        <button
                          onClick={() => handleDeleteAddress(addr.id)}
                          style={{
                            background: 'transparent',
                            border: 'none',
                            padding: '6px',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            transition: 'all 0.2s'
                          }}
                          onMouseOver={(e) => {
                            e.currentTarget.style.background = 'rgba(255, 68, 68, 0.2)';
                            const icon = e.currentTarget.querySelector('svg');
                            if (icon) (icon as SVGElement).style.color = '#ff4444';
                          }}
                          onMouseOut={(e) => {
                            e.currentTarget.style.background = 'transparent';
                            const icon = e.currentTarget.querySelector('svg');
                            if (icon) (icon as SVGElement).style.color = '#999';
                          }}
                        >
                          <Trash2 size={14} color="#999" />
                        </button>
                      </div>
                    </>
                  )}
                </div>

                {/* Address */}
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  background: 'rgba(0, 0, 0, 0.3)',
                  padding: '8px 12px',
                  borderRadius: '8px'
                }}>
                  <span
                    style={{
                      fontSize: '13px',
                      color: '#999',
                      fontFamily: "'SF Mono', monospace",
                      cursor: onSelectAddress ? 'pointer' : 'default'
                    }}
                    onClick={() => onSelectAddress?.(addr.address)}
                    title={addr.address}
                  >
                    {formatAddress(addr.address)}
                  </span>
                  <button
                    onClick={() => handleCopyAddress(addr.address)}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      padding: '4px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      transition: 'all 0.2s'
                    }}
                    onMouseOver={(e) => {
                      const icon = e.currentTarget.querySelector('svg');
                      if (icon) (icon as SVGElement).style.color = '#FF6B00';
                    }}
                    onMouseOut={(e) => {
                      const icon = e.currentTarget.querySelector('svg');
                      if (icon) (icon as SVGElement).style.color = '#999';
                    }}
                  >
                    <Copy size={14} color="#999" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add Modal */}
      {showAddModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.8)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 10000,
          backdropFilter: 'blur(8px)'
        }}
        onClick={() => setShowAddModal(false)}>
          <div style={{
            background: 'rgba(20, 20, 35, 0.98)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '20px',
            padding: '32px',
            maxWidth: '450px',
            width: '90%',
            boxShadow: '0 24px 64px rgba(0, 0, 0, 0.5)'
          }}
          onClick={(e) => e.stopPropagation()}>
            <h3 style={{
              margin: '0 0 24px 0',
              fontSize: '20px',
              fontWeight: '700',
              color: '#fff',
              fontFamily: "'Space Grotesk', sans-serif"
            }}>
              Add New Address
            </h3>

            <div style={{ marginBottom: '20px' }}>
              <label style={{
                display: 'block',
                color: '#999',
                fontSize: '13px',
                marginBottom: '8px',
                fontWeight: '600',
                fontFamily: "'DM Sans', sans-serif"
              }}>
                Name
              </label>
              <input
                type="text"
                placeholder="John, Alice, etc."
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                style={{
                  width: '100%',
                  background: 'rgba(0, 0, 0, 0.3)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '12px',
                  padding: '12px',
                  color: '#fff',
                  fontSize: '14px',
                  fontFamily: "'Space Grotesk', sans-serif",
                  boxSizing: 'border-box'
                }}
              />
            </div>

            <div style={{ marginBottom: '24px' }}>
              <label style={{
                display: 'block',
                color: '#999',
                fontSize: '13px',
                marginBottom: '8px',
                fontWeight: '600',
                fontFamily: "'DM Sans', sans-serif"
              }}>
                Ethereum Address
              </label>
              <input
                type="text"
                placeholder="0x..."
                value={newAddress}
                onChange={(e) => setNewAddress(e.target.value)}
                style={{
                  width: '100%',
                  background: 'rgba(0, 0, 0, 0.3)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '12px',
                  padding: '12px',
                  color: '#fff',
                  fontSize: '14px',
                  fontFamily: "'SF Mono', monospace",
                  boxSizing: 'border-box'
                }}
              />
            </div>

            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                onClick={handleAddAddress}
                style={{
                  flex: 1,
                  background: '#FF6B00',
                  border: 'none',
                  padding: '12px',
                  borderRadius: '12px',
                  color: '#fff',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  fontFamily: "'Space Grotesk', sans-serif",
                  transition: 'all 0.2s'
                }}
                onMouseOver={(e) => e.currentTarget.style.background = '#FF8533'}
                onMouseOut={(e) => e.currentTarget.style.background = '#FF6B00'}
              >
                Save
              </button>
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setNewName('');
                  setNewAddress('');
                }}
                style={{
                  flex: 1,
                  background: 'transparent',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  padding: '12px',
                  borderRadius: '12px',
                  color: '#999',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  fontFamily: "'Space Grotesk', sans-serif"
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
