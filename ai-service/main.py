from fastapi import FastAPI
from pydantic import BaseModel
from typing import Optional, List
from optimizer.recovery_optimizer import RecoveryOptimizer

app = FastAPI(
    title="AeroSync AI Optimization Service",
    description="Python FastAPI + Google OR-Tools AI Solver Service for Airline Operations Control",
    version="1.0.0"
)

class DisruptionPayload(BaseModel):
    disruptionId: str
    flightNumber: str
    delayMinutes: int
    aircraftUnavailable: Optional[bool] = False
    crewUnavailable: Optional[bool] = False

@app.get("/")
def read_root():
    return {
        "success": True,
        "service": "AeroSync AI Optimization Service",
        "solver": "Google OR-Tools CP-SAT",
        "status": "HEALTHY"
    }

@app.post("/api/py/optimize")
def optimize_disruption(payload: DisruptionPayload):
    optimizer = RecoveryOptimizer([], [], [])
    solution = optimizer.solve_disruption(payload.model_dump())
    return {
        "success": True,
        "payload": payload,
        "solution": solution
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
