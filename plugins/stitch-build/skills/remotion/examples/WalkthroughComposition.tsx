import React from 'react';
import {Composition} from 'remotion';
import {Sequence} from 'remotion';
import {fade} from '@remotion/transitions/fade';
import {slide} from '@remotion/transitions/slide';
import {TransitionSeries, linearTiming} from '@remotion/transitions';
import {ScreenSlide} from './ScreenSlide';
import screensManifest from '../screens.json';

const TRANSITION_DURATION_IN_FRAMES = 20;

// Calculate total duration in frames. Each transition overlaps the two
// adjacent sequences, so it shortens the total by its own duration.
const calculateDuration = () => {
  const totalSeconds = screensManifest.screens.reduce(
    (sum, screen) => sum + screen.duration,
    0
  );
  const transitionCount = Math.max(screensManifest.screens.length - 1, 0);
  return (
    totalSeconds * screensManifest.videoConfig.fps -
    transitionCount * TRANSITION_DURATION_IN_FRAMES
  );
};

export const WalkthroughComposition: React.FC = () => {
  const {fps, width, height} = screensManifest.videoConfig;

  return (
    <TransitionSeries>
      {screensManifest.screens.map((screen, index) => {
        const durationInFrames = screen.duration * fps;
        
        // Select transition based on screen config
        const transition =
          screen.transitionType === 'slide'
            ? slide()
            : screen.transitionType === 'zoom'
            ? fade() // Can customize with zoom effect
            : fade();

        // Transitions must be direct children of <TransitionSeries>, placed
        // between two sequences (fragments are flattened).
        return (
          <React.Fragment key={screen.id}>
            <TransitionSeries.Sequence durationInFrames={durationInFrames}>
              <ScreenSlide
                imageSrc={screen.imagePath}
                title={screen.title}
                description={screen.description}
                width={screen.width}
                height={screen.height}
              />
            </TransitionSeries.Sequence>
            {index < screensManifest.screens.length - 1 && (
              <TransitionSeries.Transition
                presentation={transition}
                timing={linearTiming({
                  durationInFrames: TRANSITION_DURATION_IN_FRAMES,
                })}
              />
            )}
          </React.Fragment>
        );
      })}
    </TransitionSeries>
  );
};

// Register composition
export const RemotionRoot: React.FC = () => {
  const {fps, width, height} = screensManifest.videoConfig;
  const durationInFrames = calculateDuration();

  return (
    <>
      <Composition
        id="WalkthroughComposition"
        component={WalkthroughComposition}
        durationInFrames={durationInFrames}
        fps={fps}
        width={width}
        height={height}
      />
    </>
  );
};
