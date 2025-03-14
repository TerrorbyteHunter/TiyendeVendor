
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";

interface Stop {
  name: string;
  distanceFromOrigin: number;
}

interface StopsSelectorProps {
  stops: Stop[];
  onChange: (stops: Stop[]) => void;
}

export function StopsSelector({ stops, onChange }: StopsSelectorProps) {
  const [name, setName] = useState("");
  const [distance, setDistance] = useState("");

  const addStop = () => {
    if (name && distance) {
      const newStop = {
        name,
        distanceFromOrigin: parseFloat(distance)
      };
      onChange([...stops, newStop].sort((a, b) => a.distanceFromOrigin - b.distanceFromOrigin));
      setName("");
      setDistance("");
    }
  };

  const removeStop = (index: number) => {
    const newStops = stops.filter((_, i) => i !== index);
    onChange(newStops);
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <Input
          placeholder="Stop name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <Input
          type="number"
          placeholder="Distance (km)"
          value={distance}
          onChange={(e) => setDistance(e.target.value)}
        />
        <Button type="button" onClick={addStop}>Add Stop</Button>
      </div>
      
      {stops.length > 0 && (
        <div className="space-y-2">
          {stops.map((stop, index) => (
            <div key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded">
              <span>{stop.name} ({stop.distanceFromOrigin}km)</span>
              <Button 
                type="button" 
                variant="ghost" 
                size="sm"
                onClick={() => removeStop(index)}
              >
                Remove
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
