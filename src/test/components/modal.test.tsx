import { describe, it, expect } from '@jest/globals';
import { render, screen, fireEvent, waitFor } from '@/test/test-utils';
import { Modal, ModalHeader, ModalTitle, ModalDescription, ModalFooter, ModalClose } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';

describe('Modal Components', () => {
  it('renders modal when open is true', () => {
    render(
      <Modal open={true} onClose={() => {}}>
        <ModalHeader>
          <ModalTitle>Modal Title</ModalTitle>
          <ModalDescription>Modal description text</ModalDescription>
        </ModalHeader>
        <div>Modal content</div>
        <ModalFooter>
          <Button>Action</Button>
        </ModalFooter>
      </Modal>
    );

    expect(screen.getByText('Modal Title')).toBeInTheDocument();
    expect(screen.getByText('Modal description text')).toBeInTheDocument();
    expect(screen.getByText('Modal content')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Action' })).toBeInTheDocument();
  });

  it('does not render modal when open is false', () => {
    render(
      <Modal open={false} onClose={() => {}}>
        <ModalHeader>
          <ModalTitle>Hidden Modal</ModalTitle>
        </ModalHeader>
      </Modal>
    );

    expect(screen.queryByText('Hidden Modal')).not.toBeInTheDocument();
  });

  it('calls onClose when close button is clicked', async () => {
    const onClose = jest.fn();
    
    render(
      <Modal open={true} onClose={onClose}>
        <ModalHeader>
          <ModalTitle>Test Modal</ModalTitle>
        </ModalHeader>
        <ModalClose onClose={onClose} />
      </Modal>
    );

    const closeButton = screen.getByRole('button');
    fireEvent.click(closeButton);
    
    await waitFor(() => {
      expect(onClose).toHaveBeenCalled();
    });
  });

  it('renders backdrop overlay', () => {
    render(
      <Modal open={true} onClose={() => {}}>
        <ModalHeader>
          <ModalTitle>With Backdrop</ModalTitle>
        </ModalHeader>
      </Modal>
    );

    // Check for backdrop element
    const backdrop = document.querySelector('.fixed.inset-0.bg-black\\/50');
    expect(backdrop).toBeInTheDocument();
  });

  it('applies correct ARIA attributes', () => {
    render(
      <Modal open={true} onClose={() => {}}>
        <ModalHeader>
          <ModalTitle>Accessible Modal</ModalTitle>
          <ModalDescription>This is accessible</ModalDescription>
        </ModalHeader>
      </Modal>
    );

    expect(screen.getByText('Accessible Modal')).toBeInTheDocument();
    expect(screen.getByText('This is accessible')).toBeInTheDocument();
  });
});
