import { render, screen, fireEvent } from '@testing-library/react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';

describe('Tabs Components', () => {
  const TestTabs = () => (
    <Tabs defaultValue="tab1">
      <TabsList>
        <TabsTrigger value="tab1">Tab 1</TabsTrigger>
        <TabsTrigger value="tab2">Tab 2</TabsTrigger>
        <TabsTrigger value="tab3">Tab 3</TabsTrigger>
      </TabsList>
      <TabsContent value="tab1">Content 1</TabsContent>
      <TabsContent value="tab2">Content 2</TabsContent>
      <TabsContent value="tab3">Content 3</TabsContent>
    </Tabs>
  );

  it('renders tabs with default value', () => {
    render(<TestTabs />);
    
    expect(screen.getByText('Tab 1')).toBeInTheDocument();
    expect(screen.getByText('Tab 2')).toBeInTheDocument();
    expect(screen.getByText('Tab 3')).toBeInTheDocument();
    expect(screen.getByText('Content 1')).toBeInTheDocument();
  });

  it('shows first tab content by default', () => {
    render(<TestTabs />);
    expect(screen.getByText('Content 1')).toBeVisible();
    expect(screen.queryByText('Content 2')).not.toBeInTheDocument();
  });

  it('switches content when tab is clicked', () => {
    render(<TestTabs />);
    
    fireEvent.click(screen.getByText('Tab 2'));
    
    expect(screen.queryByText('Content 1')).not.toBeInTheDocument();
    expect(screen.getByText('Content 2')).toBeVisible();
  });

  it('applies active styles to selected tab', () => {
    render(<TestTabs />);
    
    const tab1 = screen.getByText('Tab 1');
    const tab2 = screen.getByText('Tab 2');
    
    // Active tab gets bg-background class, inactive does not
    expect(tab1).toHaveClass('bg-background');
    expect(tab2).not.toHaveClass('bg-background');
    
    fireEvent.click(tab2);
    
    expect(tab1).not.toHaveClass('bg-background');
    expect(tab2).toHaveClass('bg-background');
  });

  it('maintains state across multiple clicks', () => {
    render(<TestTabs />);
    
    fireEvent.click(screen.getByText('Tab 3'));
    expect(screen.getByText('Content 3')).toBeVisible();
    
    fireEvent.click(screen.getByText('Tab 1'));
    expect(screen.getByText('Content 1')).toBeVisible();
    
    fireEvent.click(screen.getByText('Tab 2'));
    expect(screen.getByText('Content 2')).toBeVisible();
  });

  describe('TabsList', () => {
    it('renders as a container for triggers', () => {
      render(<TestTabs />);
      const triggers = screen.getAllByRole('button');
      expect(triggers).toHaveLength(3);
    });
  });

  describe('TabsTrigger', () => {
    it('is clickable', () => {
      const handleClick = jest.fn();
      render(
        <Tabs defaultValue="tab1">
          <TabsList>
            <TabsTrigger value="tab1" onClick={handleClick}>Tab 1</TabsTrigger>
          </TabsList>
          <TabsContent value="tab1">Content</TabsContent>
        </Tabs>
      );
      
      fireEvent.click(screen.getByText('Tab 1'));
      expect(handleClick).toHaveBeenCalled();
    });
  });

  describe('TabsContent', () => {
    it('only renders when value matches active tab', () => {
      render(<TestTabs />);
      
      expect(screen.getByText('Content 1')).toBeInTheDocument();
      expect(screen.queryByText('Content 2')).not.toBeInTheDocument();
      expect(screen.queryByText('Content 3')).not.toBeInTheDocument();
    });
  });
});
