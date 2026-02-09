import { describe, it, expect } from '@jest/globals';
import { render, screen, fireEvent } from '@/test/test-utils';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';

describe('Card Components', () => {
  it('renders Card with all subcomponents', () => {
    render(
      <Card>
        <CardHeader>
          <CardTitle>Test Title</CardTitle>
          <CardDescription>Test Description</CardDescription>
        </CardHeader>
        <CardContent>Card content here</CardContent>
        <CardFooter>Footer content</CardFooter>
      </Card>
    );

    expect(screen.getByText('Test Title')).toBeInTheDocument();
    expect(screen.getByText('Test Description')).toBeInTheDocument();
    expect(screen.getByText('Card content here')).toBeInTheDocument();
    expect(screen.getByText('Footer content')).toBeInTheDocument();
  });

  it('applies custom className to Card', () => {
    render(<Card className="custom-card" data-testid="card">Content</Card>);
    expect(screen.getByTestId('card')).toHaveClass('custom-card');
  });

  it('applies correct base styles to Card', () => {
    render(<Card data-testid="card">Content</Card>);
    const card = screen.getByTestId('card');
    expect(card).toHaveClass('rounded-lg', 'border', 'bg-card');
  });

  it('applies correct styles to CardHeader', () => {
    render(
      <CardHeader data-testid="header">
        <CardTitle>Title</CardTitle>
      </CardHeader>
    );
    expect(screen.getByTestId('header')).toHaveClass('flex', 'flex-col', 'space-y-1.5', 'p-6');
  });

  it('applies correct styles to CardTitle', () => {
    render(<CardTitle data-testid="title">Title</CardTitle>);
    expect(screen.getByTestId('title')).toHaveClass('text-2xl', 'font-semibold');
  });

  it('applies correct styles to CardDescription', () => {
    render(<CardDescription data-testid="desc">Description</CardDescription>);
    expect(screen.getByTestId('desc')).toHaveClass('text-sm', 'text-muted-foreground');
  });

  it('Card can be clicked', () => {
    const handleClick = jest.fn();
    render(
      <Card onClick={handleClick} data-testid="card">
        Clickable Card
      </Card>
    );
    
    fireEvent.click(screen.getByTestId('card'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });
});
