import { useState, useCallback } from 'react';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { PageHeader } from '@/components/shared/PageHeader';
import { UploadRecordings } from '@/components/scenarios/UploadRecordings';
import { ProcessingState } from '@/components/scenarios/ProcessingState';
import { ScenarioOverview } from '@/components/scenarios/ScenarioOverview';
import { ScenarioDetail } from '@/components/scenarios/ScenarioDetail';
import { mockScenarios, type Scenario } from '@/data/scenarioMockData';

type Screen = 'upload' | 'processing' | 'overview' | 'detail';

export default function ScenarioDiscovery() {
  const navigate = useNavigate();
  const [screen, setScreen] = useState<Screen>('upload');
  const [selectedScenario, setSelectedScenario] = useState<Scenario | null>(null);

  const handleAnalyze = () => setScreen('processing');
  const handleProcessingComplete = useCallback(() => setScreen('overview'), []);
  const handleViewScenario = (scenario: Scenario) => {
    setSelectedScenario(scenario);
    setScreen('detail');
  };
  const handleBackToOverview = () => {
    setSelectedScenario(null);
    setScreen('overview');
  };

  return (
    <div>
      <PageHeader
        title="Scenario Discovery"
        subtitle="Analyze call recordings to discover conversation patterns"
        actions={
          <Button variant="outline" onClick={() => navigate('/')}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Agents
          </Button>
        }
      />

      {screen === 'upload' && <UploadRecordings onAnalyze={handleAnalyze} />}
      {screen === 'processing' && <ProcessingState onComplete={handleProcessingComplete} />}
      {screen === 'overview' && (
        <ScenarioOverview scenarios={mockScenarios} onViewScenario={handleViewScenario} />
      )}
      {screen === 'detail' && selectedScenario && (
        <ScenarioDetail scenario={selectedScenario} onBack={handleBackToOverview} />
      )}
    </div>
  );
}
