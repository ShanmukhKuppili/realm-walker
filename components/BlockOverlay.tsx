/**
 * BlockOverlay Component
 * 
 * Renders a single 20m x 20m grid cell on the map as a colored polygon.
 * Color indicates ownership: Blue (user), Green (guild), Red (enemy), Gray (unclaimed)
 */
import React, { memo } from 'react';
import { Polygon } from 'react-native-maps';
import { gridCellToBounds } from '@/utils/gridUtils';
import { BlockOwnership } from '@/screens/MapScreen';

interface BlockOverlayProps {
    cellId: string;
    ownership: BlockOwnership;
    isSelected?: boolean;
    isCurrent?: boolean;
    onPress?: () => void;
}

// Color scheme for different ownership types
const COLORS: Record<BlockOwnership, { fill: string; stroke: string }> = {
    user: {
        fill: 'rgba(33, 150, 243, 0.3)',    // Blue with transparency
        stroke: 'rgba(33, 150, 243, 0.8)',
    },
    guild: {
        fill: 'rgba(76, 175, 80, 0.3)',     // Green with transparency
        stroke: 'rgba(76, 175, 80, 0.8)',
    },
    enemy: {
        fill: 'rgba(244, 67, 54, 0.3)',     // Red with transparency
        stroke: 'rgba(244, 67, 54, 0.8)',
    },
    unclaimed: {
        fill: 'rgba(158, 158, 158, 0.15)',  // Gray with low transparency
        stroke: 'rgba(158, 158, 158, 0.4)',
    },
};

function BlockOverlay({
    cellId,
    ownership,
    isSelected = false,
    isCurrent = false,
    onPress,
}: BlockOverlayProps) {
    // Get the bounds of this grid cell
    const bounds = gridCellToBounds(cellId);
    
    // Create polygon coordinates (clockwise from top-left)
    const coordinates = [
        { latitude: bounds.north, longitude: bounds.west },  // Top-left
        { latitude: bounds.north, longitude: bounds.east },  // Top-right
        { latitude: bounds.south, longitude: bounds.east },  // Bottom-right
        { latitude: bounds.south, longitude: bounds.west },  // Bottom-left
    ];

    // Get colors based on ownership
    const colors = COLORS[ownership];
    
    // Enhance visual appearance for selected or current block
    let fillColor = colors.fill;
    let strokeColor = colors.stroke;
    let strokeWidth = 1;
    
    if (isCurrent) {
        // Current block: thicker border, more opaque
        strokeWidth = 3;
        fillColor = fillColor.replace('0.3', '0.5').replace('0.15', '0.3');
        strokeColor = strokeColor.replace('0.8', '1.0').replace('0.4', '0.7');
    } else if (isSelected) {
        // Selected block: medium border
        strokeWidth = 2;
        fillColor = fillColor.replace('0.3', '0.4').replace('0.15', '0.25');
    }

    return (
        <Polygon
            coordinates={coordinates}
            fillColor={fillColor}
            strokeColor={strokeColor}
            strokeWidth={strokeWidth}
            tappable={true}
            onPress={onPress}
            zIndex={isCurrent ? 1000 : isSelected ? 100 : 1}
        />
    );
}

// Memoize to prevent unnecessary re-renders
// Only re-render if ownership, selection, or current status changes
export default memo(
    BlockOverlay,
    (prevProps, nextProps) =>
        prevProps.cellId === nextProps.cellId &&
        prevProps.ownership === nextProps.ownership &&
        prevProps.isSelected === nextProps.isSelected &&
        prevProps.isCurrent === nextProps.isCurrent
);
