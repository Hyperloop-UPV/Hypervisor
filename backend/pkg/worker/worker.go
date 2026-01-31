package worker

import (
	"context"
	"time"
)

type Worker struct {
	interval time.Duration
	run      func(context.Context)
}

func New(interval time.Duration, run func(context.Context)) *Worker {
	return &Worker{
		interval: interval,
		run:      run,
	}
}

func (w *Worker) Start(ctx context.Context) {
	ticker := time.NewTicker(w.interval)

	go func() {
		defer ticker.Stop()

		for {
			select {
			case <-ticker.C:
				w.run(ctx)
			case <-ctx.Done():
				return
			}
		}
	}()
}
