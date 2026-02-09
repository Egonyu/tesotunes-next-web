import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Modal, ModalHeader, ModalTitle, ModalDescription, ModalFooter, ModalClose } from '@/components/ui/modal';

describe('Modal Components', () => {
  describe('Modal', () => {
    it('renders when open is true', () => {
      render(
        <Modal open={true} onClose={() => {}}>
          <div>Modal content</div>
        </Modal>
      );
      expect(screen.getByText('Modal content')).toBeInTheDocument();
    });

    it('does not render when open is false', () => {
      render(
        <Modal open={false} onClose={() => {}}>
          <div>Modal content</div>
        </Modal>
      );
      expect(screen.queryByText('Modal content')).not.toBeInTheDocument();
    });

    it('calls onClose when overlay is clicked', () => {
      const handleClose = jest.fn();
      const { container } = render(
        <Modal open={true} onClose={handleClose}>
          <div>Content</div>
        </Modal>
      );
      
      // Click on the backdrop overlay (first child of the modal wrapper)
      const modalWrapper = container.firstElementChild!;
      const backdrop = modalWrapper.firstElementChild!;
      fireEvent.click(backdrop);
      
      expect(handleClose).toHaveBeenCalled();
    });

    it('does not close when modal content is clicked', () => {
      const handleClose = jest.fn();
      render(
        <Modal open={true} onClose={handleClose}>
          <div data-testid="modal-content">Content</div>
        </Modal>
      );
      
      fireEvent.click(screen.getByTestId('modal-content'));
      expect(handleClose).not.toHaveBeenCalled();
    });

    it('calls onClose when Escape key is pressed', () => {
      const handleClose = jest.fn();
      render(
        <Modal open={true} onClose={handleClose}>
          <div>Content</div>
        </Modal>
      );
      
      fireEvent.keyDown(document, { key: 'Escape' });
      expect(handleClose).toHaveBeenCalled();
    });
  });

  describe('ModalHeader', () => {
    it('renders correctly', () => {
      render(
        <Modal open={true} onClose={() => {}}>
          <ModalHeader>Header content</ModalHeader>
        </Modal>
      );
      expect(screen.getByText('Header content')).toBeInTheDocument();
    });
  });

  describe('ModalTitle', () => {
    it('renders as h2', () => {
      render(
        <Modal open={true} onClose={() => {}}>
          <ModalTitle>Title</ModalTitle>
        </Modal>
      );
      const title = screen.getByText('Title');
      expect(title.tagName).toBe('H2');
    });
  });

  describe('ModalDescription', () => {
    it('renders correctly', () => {
      render(
        <Modal open={true} onClose={() => {}}>
          <ModalDescription>Description text</ModalDescription>
        </Modal>
      );
      expect(screen.getByText('Description text')).toBeInTheDocument();
    });
  });

  describe('ModalFooter', () => {
    it('renders children', () => {
      render(
        <Modal open={true} onClose={() => {}}>
          <ModalFooter>
            <button>Cancel</button>
            <button>Confirm</button>
          </ModalFooter>
        </Modal>
      );
      expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Confirm' })).toBeInTheDocument();
    });
  });

  describe('ModalClose', () => {
    it('calls parent onClose when clicked', () => {
      const handleClose = jest.fn();
      render(
        <Modal open={true} onClose={handleClose}>
          <ModalClose onClose={handleClose} />
        </Modal>
      );
      
      fireEvent.click(screen.getByRole('button'));
      expect(handleClose).toHaveBeenCalled();
    });
  });

  describe('Full Modal', () => {
    it('renders complete modal structure', () => {
      render(
        <Modal open={true} onClose={() => {}}>
          <ModalHeader>
            <ModalTitle>Confirm Action</ModalTitle>
            <ModalDescription>Are you sure you want to proceed?</ModalDescription>
          </ModalHeader>
          <div>Modal body content</div>
          <ModalFooter>
            <button>Cancel</button>
            <button>Confirm</button>
          </ModalFooter>
          <ModalClose />
        </Modal>
      );

      expect(screen.getByText('Confirm Action')).toBeInTheDocument();
      expect(screen.getByText('Are you sure you want to proceed?')).toBeInTheDocument();
      expect(screen.getByText('Modal body content')).toBeInTheDocument();
    });
  });
});
