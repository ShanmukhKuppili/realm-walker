/**
 * Example: Integrating Grid Utils with Location Service
 * Demonstrates real-world usage in Realm Walker
 */

import { useLocation } from '@/hooks/useLocation';
import {
    calculateDistance,
    getCellsInRadius,
    getNeighboringCells,
    getPrecisionInfo,
    gridCellToBounds,
    isPointInCell
} from '@/utils/gridUtils';
import React, { useEffect, useState } from 'react';
import { Button, ScrollView, StyleSheet, Text, View } from 'react-native';

export default function GridUtilsExample() {
  const {
    currentBlock,
    latitude,
    longitude,
    isTracking,
    startTracking,
    requestPermission,
  } = useLocation();

  const [cellInfo, setCellInfo] = useState<any>(null);
  const [neighbors, setNeighbors] = useState<string[]>([]);
  const [nearbyCells, setNearbyCells] = useState<string[]>([]);

  // Update grid info when location changes
  useEffect(() => {
    if (latitude && longitude && currentBlock) {
      // Get cell bounds
      const bounds = gridCellToBounds(currentBlock.blockId);
      
      // Get neighboring cells
      const neighborCells = getNeighboringCells(currentBlock.blockId);
      
      // Get cells within 100m
      const cellsInRadius = getCellsInRadius(latitude, longitude, 100);
      
      // Get precision info
      const precision = getPrecisionInfo(latitude);
      
      // Check if actually in cell
      const inCell = isPointInCell(latitude, longitude, currentBlock.blockId);

      setCellInfo({
        cellId: currentBlock.blockId,
        bounds,
        precision,
        inCell,
      });
      
      setNeighbors(neighborCells);
      setNearbyCells(cellsInRadius);
    }
  }, [latitude, longitude, currentBlock]);

  // Example: Claim current territory
  const handleClaimTerritory = () => {
    if (!latitude || !longitude || !currentBlock) {
      alert('Location not available');
      return;
    }

    // Verify user is in the cell
    if (!isPointInCell(latitude, longitude, currentBlock.blockId)) {
      alert('You must be inside the cell to claim it!');
      return;
    }

    // In real app, send to backend
    console.log('Claiming cell:', currentBlock.blockId);
    alert(`Claimed territory: ${currentBlock.blockId}`);
  };

  // Example: Find distance to a landmark
  const calculateDistanceToLandmark = () => {
    if (!latitude || !longitude) return;

    // Example: Distance to Statue of Liberty
    const statueLat = 40.6892;
    const statueLon = -74.0445;
    
    const distance = calculateDistance(
      latitude,
      longitude,
      statueLat,
      statueLon
    );

    alert(`Distance to Statue of Liberty: ${(distance / 1000).toFixed(2)} km`);
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Grid Utils Integration Example</Text>

      {/* Location Status */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>📍 Location Status</Text>
        {!isTracking ? (
          <View>
            <Button title="Request Permission" onPress={requestPermission} />
            <Button title="Start Tracking" onPress={startTracking} />
          </View>
        ) : (
          <View>
            <Text>✓ Tracking active</Text>
            {latitude && longitude && (
              <Text>
                Position: {latitude.toFixed(6)}, {longitude.toFixed(6)}
              </Text>
            )}
          </View>
        )}
      </View>

      {/* Current Cell Info */}
      {cellInfo && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🗺️ Current Cell</Text>
          <Text style={styles.cellId}>{cellInfo.cellId}</Text>
          
          <View style={styles.infoRow}>
            <Text>Status: </Text>
            <Text style={cellInfo.inCell ? styles.success : styles.warning}>
              {cellInfo.inCell ? '✓ Inside cell' : '⚠ Outside cell'}
            </Text>
          </View>

          <Text style={styles.subtitle}>Bounds (20m × 20m):</Text>
          <Text>  North: {cellInfo.bounds.north.toFixed(6)}</Text>
          <Text>  South: {cellInfo.bounds.south.toFixed(6)}</Text>
          <Text>  East: {cellInfo.bounds.east.toFixed(6)}</Text>
          <Text>  West: {cellInfo.bounds.west.toFixed(6)}</Text>

          <Text style={styles.subtitle}>Precision at this latitude:</Text>
          <Text>
            4 decimals = ~{cellInfo.precision.fourDecimalLatMeters.toFixed(2)}m (lat)
          </Text>
          <Text>
            4 decimals = ~{cellInfo.precision.fourDecimalLonMeters.toFixed(2)}m (lon)
          </Text>

          <Button title="Claim Territory" onPress={handleClaimTerritory} />
        </View>
      )}

      {/* Neighboring Cells */}
      {neighbors.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🧭 Neighboring Cells (8)</Text>
          {neighbors.map((cellId, index) => {
            const directions = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
            return (
              <Text key={cellId} style={styles.neighbor}>
                {directions[index]}: {cellId}
              </Text>
            );
          })}
        </View>
      )}

      {/* Cells in Radius */}
      {nearbyCells.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📡 Cells in 100m Radius</Text>
          <Text>Total cells: {nearbyCells.length}</Text>
          <Text style={styles.subtitle}>Sample (first 5):</Text>
          {nearbyCells.slice(0, 5).map((cellId) => (
            <Text key={cellId} style={styles.cellItem}>• {cellId}</Text>
          ))}
          {nearbyCells.length > 5 && (
            <Text style={styles.more}>
              ... and {nearbyCells.length - 5} more
            </Text>
          )}
        </View>
      )}

      {/* Actions */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>🎯 Actions</Text>
        <Button
          title="Calculate Distance to Landmark"
          onPress={calculateDistanceToLandmark}
        />
      </View>

      {/* Example Code */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>💻 Example Code</Text>
        <Text style={styles.code}>
          {`import { latLonToGridCell } from '@/utils/gridUtils';

const cellId = latLonToGridCell(${latitude?.toFixed(6)}, ${longitude?.toFixed(6)});
// Result: "${cellInfo?.cellId}"`}
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  section: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 14,
    fontWeight: '600',
    marginTop: 12,
    marginBottom: 4,
    color: '#666',
  },
  cellId: {
    fontSize: 16,
    fontFamily: 'monospace',
    backgroundColor: '#f0f0f0',
    padding: 8,
    borderRadius: 4,
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  success: {
    color: 'green',
    fontWeight: 'bold',
  },
  warning: {
    color: 'orange',
    fontWeight: 'bold',
  },
  neighbor: {
    fontSize: 12,
    fontFamily: 'monospace',
    paddingVertical: 2,
  },
  cellItem: {
    fontSize: 12,
    fontFamily: 'monospace',
    paddingVertical: 2,
    color: '#666',
  },
  more: {
    fontSize: 12,
    color: '#999',
    fontStyle: 'italic',
    marginTop: 4,
  },
  code: {
    fontSize: 12,
    fontFamily: 'monospace',
    backgroundColor: '#f0f0f0',
    padding: 12,
    borderRadius: 4,
    color: '#333',
  },
});
