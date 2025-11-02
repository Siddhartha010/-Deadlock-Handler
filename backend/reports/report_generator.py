import json
import datetime
from reportlab.lib.pagesizes import letter, A4
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from reportlab.lib import colors

class ReportGenerator:
    def __init__(self):
        self.styles = getSampleStyleSheet()
        self.custom_styles = self._create_custom_styles()
    
    def _create_custom_styles(self):
        return {
            'CustomTitle': ParagraphStyle(
                'CustomTitle',
                parent=self.styles['Heading1'],
                fontSize=18,
                spaceAfter=30,
                textColor=colors.darkblue
            ),
            'CustomHeading': ParagraphStyle(
                'CustomHeading',
                parent=self.styles['Heading2'],
                fontSize=14,
                spaceAfter=12,
                textColor=colors.darkgreen
            )
        }
    
    def generate_simulation_report(self, simulation_data, filename=None):
        if not filename:
            timestamp = datetime.datetime.now().strftime("%Y%m%d_%H%M%S")
            filename = f"deadlock_simulation_{timestamp}.pdf"
        
        doc = SimpleDocTemplate(filename, pagesize=A4)
        story = []
        
        # Title
        title = Paragraph("Deadlock Handling Simulation Report", self.custom_styles['CustomTitle'])
        story.append(title)
        story.append(Spacer(1, 12))
        
        # Simulation Info
        info_text = f"""
        <b>Simulation Date:</b> {datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")}<br/>
        <b>Algorithm:</b> {simulation_data.get('algorithm', 'N/A')}<br/>
        <b>Processes:</b> {simulation_data.get('processes', 'N/A')}<br/>
        <b>Resources:</b> {simulation_data.get('resources', 'N/A')}<br/>
        <b>Result:</b> {simulation_data.get('result', 'N/A')}
        """
        story.append(Paragraph(info_text, self.styles['Normal']))
        story.append(Spacer(1, 20))
        
        # Algorithm Steps
        if 'steps' in simulation_data:
            story.append(Paragraph("Algorithm Execution Steps", self.custom_styles['CustomHeading']))
            
            for step in simulation_data['steps']:
                step_text = f"<b>Step {step.get('step', 0)}:</b> {step.get('description', '')}"
                story.append(Paragraph(step_text, self.styles['Normal']))
                story.append(Spacer(1, 6))
        
        # Matrices
        if 'matrices' in simulation_data:
            story.append(Paragraph("System Matrices", self.custom_styles['CustomHeading']))
            
            matrices = simulation_data['matrices']
            if 'allocation' in matrices:
                story.append(Paragraph("<b>Allocation Matrix:</b>", self.styles['Normal']))
                allocation_table = self._create_matrix_table(matrices['allocation'])
                story.append(allocation_table)
                story.append(Spacer(1, 12))
        
        # Results Analysis
        if 'analysis' in simulation_data:
            story.append(Paragraph("Results Analysis", self.custom_styles['CustomHeading']))
            analysis_text = simulation_data['analysis']
            story.append(Paragraph(analysis_text, self.styles['Normal']))
        
        doc.build(story)
        return filename
    
    def _create_matrix_table(self, matrix_data):
        # Convert matrix to table format
        table_data = []
        if isinstance(matrix_data, list) and len(matrix_data) > 0:
            # Add header row
            header = ['Process'] + [f'R{i}' for i in range(len(matrix_data[0]))]
            table_data.append(header)
            
            # Add data rows
            for i, row in enumerate(matrix_data):
                table_row = [f'P{i}'] + [str(val) for val in row]
                table_data.append(table_row)
        
        table = Table(table_data)
        table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.grey),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
            ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, 0), 12),
            ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
            ('BACKGROUND', (0, 1), (-1, -1), colors.beige),
            ('GRID', (0, 0), (-1, -1), 1, colors.black)
        ]))
        
        return table
    
    def generate_comparison_report(self, comparison_data, filename=None):
        if not filename:
            timestamp = datetime.datetime.now().strftime("%Y%m%d_%H%M%S")
            filename = f"deadlock_strategies_comparison_{timestamp}.pdf"
        
        doc = SimpleDocTemplate(filename, pagesize=A4)
        story = []
        
        # Title
        title = Paragraph("Deadlock Handling Strategies Comparison", self.custom_styles['CustomTitle'])
        story.append(title)
        story.append(Spacer(1, 12))
        
        # Strategies comparison
        for strategy_name, strategy_data in comparison_data.items():
            story.append(Paragraph(f"{strategy_name.title()} Strategy", self.custom_styles['CustomHeading']))
            
            # Description
            if 'description' in strategy_data:
                story.append(Paragraph(f"<b>Description:</b> {strategy_data['description']}", self.styles['Normal']))
                story.append(Spacer(1, 6))
            
            # Pros and Cons
            if 'pros' in strategy_data:
                story.append(Paragraph("<b>Advantages:</b>", self.styles['Normal']))
                for pro in strategy_data['pros']:
                    story.append(Paragraph(f"• {pro}", self.styles['Normal']))
                story.append(Spacer(1, 6))
            
            if 'cons' in strategy_data:
                story.append(Paragraph("<b>Disadvantages:</b>", self.styles['Normal']))
                for con in strategy_data['cons']:
                    story.append(Paragraph(f"• {con}", self.styles['Normal']))
                story.append(Spacer(1, 12))
        
        doc.build(story)
        return filename
    
    def export_simulation_data(self, simulation_data, format='json'):
        timestamp = datetime.datetime.now().strftime("%Y%m%d_%H%M%S")
        
        if format == 'json':
            filename = f"simulation_data_{timestamp}.json"
            with open(filename, 'w') as f:
                json.dump(simulation_data, f, indent=2)
        
        elif format == 'csv':
            import pandas as pd
            filename = f"simulation_data_{timestamp}.csv"
            
            # Convert steps to DataFrame if available
            if 'steps' in simulation_data:
                df = pd.DataFrame(simulation_data['steps'])
                df.to_csv(filename, index=False)
        
        return filename